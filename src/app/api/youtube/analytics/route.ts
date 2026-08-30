import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/supabase';
import { prisma } from '@/lib/db/prisma';
import { handleApiError } from '@/lib/api/errors';
import { toJsonSafe } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const searchParams = request.nextUrl.searchParams;
    const channelId = searchParams.get('channelId');
    const videoId = searchParams.get('videoId');
    const range = searchParams.get('range') || '7d';
    const rangeDays: Record<string, number | null> = { '7d': 7, '30d': 30, '90d': 90, '1y': 365, all: null };
    if (!(range in rangeDays)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Range must be 7d, 30d, 90d, 1y, or all' } },
        { status: 400 },
      );
    }

    if (!channelId) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Channel ID is required' } },
        { status: 400 }
      );
    }

    const channel = await prisma.youTubeChannel.findFirst({
      where: { id: channelId, userId: user.id },
    });

    if (!channel) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Channel not found' } },
        { status: 404 }
      );
    }

    const cached = await prisma.analyticsCache.findMany({
      where: {
        channelId,
        ...(videoId ? { youtubeVideoId: videoId } : {}),
        ...(rangeDays[range] ? {
          metricDate: {
            gte: new Date(Date.now() - rangeDays[range]! * 24 * 60 * 60 * 1000),
          },
        } : {}),
      },
      orderBy: { metricDate: 'desc' },
      take: range === 'all' ? 365 : rangeDays[range]!,
    });

    if (cached.length > 0) {
      return NextResponse.json(toJsonSafe({ 
        success: true, 
        data: { 
          analytics: cached,
          source: 'cache',
          assessment_type: 'smartyt_assessment',
        } 
      }));
    }

    return NextResponse.json(toJsonSafe({
      success: true,
      data: {
        analytics: [],
        message: 'No analytics data available. Connect your channel and upload videos to see analytics.',
        configuration_required: true,
      },
    }));
  } catch (error) {
    return handleApiError(error, 'Failed to fetch analytics');
  }
}
