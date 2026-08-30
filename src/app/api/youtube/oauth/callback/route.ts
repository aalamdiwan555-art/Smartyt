import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getChannelInfo } from '@/lib/youtube/service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(new URL('/dashboard?error=oauth_denied', process.env.APP_BASE_URL!));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/dashboard?error=invalid_callback', process.env.APP_BASE_URL!));
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
        client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
        redirect_uri: `${process.env.APP_BASE_URL}/api/youtube/oauth/callback`,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokens.access_token) {
      return NextResponse.redirect(new URL('/dashboard?error=token_exchange_failed', process.env.APP_BASE_URL!));
    }

    const channelInfo = await getChannelInfo(tokens.access_token);

    if (!channelInfo) {
      return NextResponse.redirect(new URL('/dashboard?error=no_channel', process.env.APP_BASE_URL!));
    }

    const channelId = channelInfo.id!;
    const channelTitle = channelInfo.snippet?.title;
    const avatarUrl = channelInfo.snippet?.thumbnails?.default?.url;
    const subscriberCount = channelInfo.statistics?.subscriberCount ? BigInt(channelInfo.statistics.subscriberCount) : null;

    const existingChannel = await prisma.youTubeChannel.findFirst({
      where: { youtubeChannelId: channelId },
    });

    if (existingChannel) {
      await prisma.youTubeChannel.update({
        where: { id: existingChannel.id },
        data: {
          channelTitle,
          avatarUrl,
          subscriberCount,
          isActive: true,
        },
      });
    } else {
      const newChannel = await prisma.youTubeChannel.create({
        data: {
          userId: state,
          youtubeChannelId: channelId,
          channelTitle,
          avatarUrl,
          subscriberCount,
        },
      });

      await prisma.oAuthConnection.create({
        data: {
          userId: state,
          channelId: newChannel.id,
          accessTokenEncrypted: tokens.access_token,
          refreshTokenEncrypted: tokens.refresh_token || '',
          scope: tokens.scope,
          expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        },
      });
    }

    return NextResponse.redirect(new URL('/dashboard?success=channel_connected', process.env.APP_BASE_URL!));
  } catch (error) {
    console.error('YouTube callback error:', error);
    return NextResponse.redirect(new URL('/dashboard?error=callback_failed', process.env.APP_BASE_URL!));
  }
}
