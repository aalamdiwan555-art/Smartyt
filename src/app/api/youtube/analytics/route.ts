import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/supabase';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const searchParams = request.nextUrl.searchParams;
    const channelId = searchParams.get('channelId');
    const videoId = searchParams.get('videoId');
    const range = searchParams.get('range') || '7d';

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
      },
      orderBy: { metricDate: 'desc' },
      take: 30,
    });

    if (cached.length > 0) {
      return NextResponse.json({ 
        success: true, 
        data: { 
          analytics: cached,
          source: 'cache',
          assessment_type: 'smartyt_assessment',
        } 
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        analytics: [],
        message: 'No analytics data available. Connect your channel and upload videos to see analytics.',
        configuration_required: true,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch analytics' } },
      { status: 500 }
    );
  }
}
