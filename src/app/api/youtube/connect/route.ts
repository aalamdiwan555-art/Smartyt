import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/supabase';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const redirectUri = `${process.env.APP_BASE_URL}/api/youtube/oauth/callback`;

    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
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
      state: user.id,
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('YouTube OAuth error:', error);
    return NextResponse.redirect(new URL('/dashboard?error=oauth_failed', process.env.APP_BASE_URL!));
  }
}
