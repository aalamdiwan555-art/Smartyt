import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/supabase';
import { prisma } from '@/lib/db/prisma';
import { generateWithAI } from '@/lib/ai/service';
import { handleApiError } from '@/lib/api/errors';
import { toJsonSafe } from '@/lib/api/response';
import { aiInputSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const parsed = aiInputSchema.safeParse(await request.json());
    if (!parsed.success || JSON.stringify(parsed.data.input).length > 20000) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'A valid generation type and bounded input are required' } },
        { status: 400 }
      );
    }
    const { type, input } = parsed.data;

    // Check usage limits
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

    // Get subscription plan
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
      free: { aiGenerations: 10 },
      pro: { aiGenerations: 100 },
      team: { aiGenerations: 500 },
    };

    const limit = limits[plan as keyof typeof limits]?.aiGenerations || 10;

    const reservation = await prisma.usage.updateMany({
      where: { id: usage.id, aiGenerationsUsed: { lt: limit } },
      data: { aiGenerationsUsed: { increment: 1 } },
    });

    if (reservation.count === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'USAGE_LIMIT_EXCEEDED', message: 'AI generation limit reached. Upgrade your plan.' } },
        { status: 429 }
      );
    }

    // Get Content DNA for personalization
    const contentDNA = await prisma.contentDNA.findUnique({
      where: { userId: user.id },
    });

    // Generate content
    const result = await generateWithAI(type, input, contentDNA || undefined);

    // Log the generation
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'ai_generate',
        metadata: { type, input: JSON.stringify(input).slice(0, 20000) },
      },
    });

    return NextResponse.json(toJsonSafe({ success: true, data: result }));
  } catch (error) {
    return handleApiError(error, 'Failed to generate content');
  }
}
