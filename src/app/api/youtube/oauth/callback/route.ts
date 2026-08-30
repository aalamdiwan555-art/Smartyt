import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { prisma } from '@/lib/db/prisma';
import { getChannelInfo } from '@/lib/youtube/service';
import { getUser } from '@/lib/auth/supabase';
import { encryptSecret } from '@/lib/security/encryption';

function getAppBaseUrl() {
  const value = process.env.APP_BASE_URL;
  if (!value) throw new Error('APP_BASE_URL is not configured');
  return value;
}

function isValidState(state: string, cookieValue: string | undefined, userId: string) {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret || !cookieValue || state !== cookieValue) return false;
  const parts = state.split('.');
  if (parts.length !== 3 || parts[0] !== userId) return false;
  const payload = `${parts[0]}.${parts[1]}`;
  const expected = createHmac('sha256', sessionSecret).update(payload).digest('hex');
  const actualBuffer = Buffer.from(parts[2], 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export async function GET(request: NextRequest) {
  const appBaseUrl = process.env.APP_BASE_URL || request.nextUrl.origin;
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      cookies().delete('yt_oauth_state');
      return NextResponse.redirect(new URL('/dashboard?error=oauth_denied', appBaseUrl));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/dashboard?error=invalid_callback', appBaseUrl));
    }

    const user = await getUser();
    if (!user || !isValidState(state, request.cookies.get('yt_oauth_state')?.value, user.id)) {
      cookies().delete('yt_oauth_state');
      return NextResponse.redirect(new URL('/login?error=invalid_oauth_state', appBaseUrl));
    }
    cookies().delete('yt_oauth_state');

    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    if (!clientId || !clientSecret) throw new Error('Google OAuth is not configured');
    const redirectUri = new URL('/api/youtube/oauth/callback', getAppBaseUrl()).toString();
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok || typeof tokens.access_token !== 'string') {
      return NextResponse.redirect(new URL('/dashboard?error=token_exchange_failed', appBaseUrl));
    }

    const channelInfo = await getChannelInfo(tokens.access_token);

    if (!channelInfo) {
      return NextResponse.redirect(new URL('/dashboard?error=no_channel', appBaseUrl));
    }

    const channelId = channelInfo.id!;
    const channelTitle = channelInfo.snippet?.title;
    const avatarUrl = channelInfo.snippet?.thumbnails?.default?.url;
    const subscriberCount = channelInfo.statistics?.subscriberCount ? BigInt(channelInfo.statistics.subscriberCount) : null;

    const existingChannel = await prisma.youTubeChannel.findFirst({
      where: { youtubeChannelId: channelId, userId: user.id },
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
    }

    const channel = existingChannel || await prisma.youTubeChannel.create({
      data: {
        userId: user.id,
        youtubeChannelId: channelId,
        channelTitle,
        avatarUrl,
        subscriberCount,
      },
    });
    const existingConnection = await prisma.oAuthConnection.findFirst({
      where: { userId: user.id, channelId: channel.id, provider: 'google' },
      orderBy: { createdAt: 'desc' },
    });
    const refreshToken = typeof tokens.refresh_token === 'string' ? tokens.refresh_token : undefined;
    const expiresIn = typeof tokens.expires_in === 'number' ? tokens.expires_in : 3600;
    const connectionData = {
      userId: user.id,
      channelId: channel.id,
      accessTokenEncrypted: encryptSecret(tokens.access_token),
      ...(refreshToken ? { refreshTokenEncrypted: encryptSecret(refreshToken) } : {}),
      scope: typeof tokens.scope === 'string' ? tokens.scope : null,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    };
    if (existingConnection) {
      await prisma.oAuthConnection.update({ where: { id: existingConnection.id }, data: connectionData });
    } else {
      await prisma.oAuthConnection.create({
        data: { ...connectionData, refreshTokenEncrypted: refreshToken ? encryptSecret(refreshToken) : '' },
      });
    }

    return NextResponse.redirect(new URL('/dashboard?success=channel_connected', appBaseUrl));
  } catch (error) {
    console.error('YouTube callback error:', error);
    return NextResponse.redirect(new URL('/dashboard?error=callback_failed', appBaseUrl));
  }
}
