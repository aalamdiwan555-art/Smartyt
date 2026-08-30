import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createHmac, randomBytes } from 'node:crypto';
import { requireAuth } from '@/lib/auth/supabase';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const appBaseUrl = process.env.APP_BASE_URL;
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const sessionSecret = process.env.SESSION_SECRET;
    if (!appBaseUrl || !clientId || !sessionSecret) throw new Error('YouTube OAuth is not configured');

    const redirectUri = new URL('/api/youtube/oauth/callback', appBaseUrl).toString();
    const nonce = randomBytes(32).toString('hex');
    const payload = `${user.id}.${nonce}`;
    const signature = createHmac('sha256', sessionSecret).update(payload).digest('hex');
    const state = `${payload}.${signature}`;
    cookies().set('yt_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/api/youtube/oauth',
    });

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: [
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/yt-analytics.readonly',
        'https://www.googleapis.com/auth/userinfo.profile',
      ].join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state,
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('YouTube OAuth error:', error);
    const baseUrl = process.env.APP_BASE_URL || request.nextUrl.origin;
    return NextResponse.redirect(new URL('/dashboard?error=oauth_failed', baseUrl));
  }
}
