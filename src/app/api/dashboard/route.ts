import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/supabase';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const [channels, drafts, ideas, recentUploads, usage, subscription] = await Promise.all([
      prisma.youTubeChannel.findMany({
        where: { userId: user.id, isActive: true },
      }),
      prisma.videoDraft.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
      prisma.idea.findMany({
        where: { userId: user.id, status: 'idea' },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.upload.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { draft: true },
      }),
      prisma.usage.findFirst({
        where: { userId: user.id },
        orderBy: { periodStart: 'desc' },
      }),
      prisma.subscription.findFirst({
        where: { userId: user.id },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        channels,
        recentDrafts: drafts,
        recentIdeas: ideas,
        recentUploads,
        usage,
        subscription,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch dashboard data' } },
      { status: 500 }
    );
  }
}
