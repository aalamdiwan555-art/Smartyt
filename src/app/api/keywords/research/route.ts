import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/supabase';
import { prisma } from '@/lib/db/prisma';
import { searchYouTube } from '@/lib/youtube/service';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { topic } = body;

    if (!topic) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Topic is required' } },
        { status: 400 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

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
      where: { userId: user.id },
    });

    const plan = subscription?.plan || 'free';
    const limits = {
      free: { keywordSearches: 5 },
      pro: { keywordSearches: 50 },
      team: { keywordSearches: 200 },
    };

    const limit = limits[plan as keyof typeof limits]?.keywordSearches || 5;

    if (usage.keywordSearchesUsed >= limit) {
      return NextResponse.json(
        { success: false, error: { code: 'USAGE_LIMIT_EXCEEDED', message: 'Keyword search limit reached. Upgrade your plan.' } },
        { status: 429 }
      );
    }

    let results = [];

    if (process.env.YOUTUBE_API_KEY) {
      try {
        const youtubeResults = await searchYouTube(topic, process.env.YOUTUBE_API_KEY);
        results = youtubeResults.map((item: any) => ({
          keyword: item.snippet?.title || topic,
          relevance: 85,
          source: 'youtube_api',
          thumbnail: item.snippet?.thumbnails?.default?.url,
        }));
      } catch (e) {
        console.log('YouTube API search failed, using AI estimate');
      }
    }

    if (results.length === 0) {
      results = generateKeywordEstimates(topic);
    }

    await prisma.usage.update({
      where: { id: usage.id },
      data: { keywordSearchesUsed: { increment: 1 } },
    });

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
    console.error('Keyword research error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to research keywords' } },
      { status: 500 }
    );
  }
}

function generateKeywordEstimates(topic: string) {
  const variations = [
    `${topic} tutorial`,
    `${topic} guide`,
    `${topic} tips`,
    `${topic} for beginners`,
    `${topic} 2024`,
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
