import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/supabase';
import { prisma } from '@/lib/db/prisma';
import { handleApiError } from '@/lib/api/errors';
import { toJsonSafe } from '@/lib/api/response';

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
        orderBy: { startedAt: 'desc' },
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

    return NextResponse.json(toJsonSafe({
      success: true,
      data: {
        channels,
        recentDrafts: drafts,
        recentIdeas: ideas,
        recentUploads,
        usage,
        subscription,
      },
    }));
  } catch (error) {
    return handleApiError(error, 'Failed to fetch dashboard data');
  }
}
