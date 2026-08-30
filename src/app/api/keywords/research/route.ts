import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/supabase';
import { prisma } from '@/lib/db/prisma';
import { searchYouTube } from '@/lib/youtube/service';
import { handleApiError } from '@/lib/api/errors';
import { keywordInputSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const parsed = keywordInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'A valid topic is required' } },
        { status: 400 }
      );
    }
    const { topic } = parsed.data;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const usage = await prisma.usage.upsert({
      where: {
        userId_periodStart: {
          userId: user.id,
          periodStart: today,
        },
      },
      update: {},
      create: {
        userId: user.id,
        periodStart: today,
      },
    });

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: 'active',
        OR: [{ currentPeriodEnd: null }, { currentPeriodEnd: { gt: new Date() } }],
      },
      orderBy: { updatedAt: 'desc' },
    });

    const plan = subscription?.plan || 'free';
    const limits = {
      free: { keywordSearches: 5 },
      pro: { keywordSearches: 50 },
      team: { keywordSearches: 200 },
    };

    const limit = limits[plan as keyof typeof limits]?.keywordSearches || 5;

    const reservation = await prisma.usage.updateMany({
      where: { id: usage.id, keywordSearchesUsed: { lt: limit } },
      data: { keywordSearchesUsed: { increment: 1 } },
    });

    if (reservation.count === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'USAGE_LIMIT_EXCEEDED', message: 'Keyword search limit reached. Upgrade your plan.' } },
        { status: 429 }
      );
    }

    type KeywordResult = {
      keyword: string;
      relevance: number;
      source: string;
      thumbnail?: string;
    };
    let results: KeywordResult[] = [];

    if (process.env.YOUTUBE_API_KEY) {
      try {
        const youtubeResults = await searchYouTube(topic, process.env.YOUTUBE_API_KEY);
        results = youtubeResults.map((item) => ({
          keyword: item.snippet?.title || topic,
          relevance: 85,
          source: 'youtube_api',
          thumbnail: item.snippet?.thumbnails?.default?.url || undefined,
        }));
      } catch (e) {
        console.error('YouTube API search failed, using AI estimate', e);
      }
    }

    if (results.length === 0) {
      results = generateKeywordEstimates(topic);
    }

    await prisma.keywordSearch.create({
      data: {
        userId: user.id,
        query: topic,
        source: results[0]?.source || 'ai_estimate',
        results: results,
      },
    });

    return NextResponse.json({ success: true, data: { keywords: results } });
  } catch (error) {
    return handleApiError(error, 'Failed to research keywords');
  }
}

function generateKeywordEstimates(topic: string) {
  const variations = [
    `${topic} tutorial`,
    `${topic} guide`,
    `${topic} tips`,
    `${topic} for beginners`,
    `${topic} ${new Date().getUTCFullYear()}`,
    `how to ${topic}`,
    `best ${topic}`,
    `${topic} review`,
    `what is ${topic}`,
    `${topic} explained`,
  ];

  return variations.map((keyword, index) => ({
    keyword,
    relevance: Math.max(60, 95 - index * 3),
    competition: index < 3 ? 'high' : 'medium',
    trend: 'stable',
    source: 'ai_estimate',
  }));
}
