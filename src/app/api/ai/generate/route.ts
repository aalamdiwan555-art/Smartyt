import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/supabase';
import { prisma } from '@/lib/db/prisma';
import { generateWithAI } from '@/lib/ai/service';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { type, input, channelId } = body;

    if (!type || !input) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Type and input are required' } },
        { status: 400 }
      );
    }

    // Check usage limits
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

    // Get subscription plan
    const subscription = await prisma.subscription.findFirst({
      where: { userId: user.id },
    });

    const plan = subscription?.plan || 'free';
    const limits = {
      free: { aiGenerations: 10 },
      pro: { aiGenerations: 100 },
      team: { aiGenerations: 500 },
    };

    const limit = limits[plan as keyof typeof limits]?.aiGenerations || 10;

    if (usage.aiGenerationsUsed >= limit) {
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

    // Increment usage
    await prisma.usage.update({
      where: { id: usage.id },
      data: { aiGenerationsUsed: { increment: 1 } },
    });

    // Log the generation
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'ai_generate',
        metadata: { type, input: JSON.stringify(input) },
      },
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('AI generate error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to generate content' } },
      { status: 500 }
    );
  }
}
