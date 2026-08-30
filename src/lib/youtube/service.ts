import { google } from 'googleapis';
import { createReadStream } from 'node:fs';

const youtube = google.youtube({ version: 'v3' });

export function getYouTubeClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.youtube({ version: 'v3', auth });
}

export async function getChannelInfo(accessToken: string) {
  const client = getYouTubeClient(accessToken);
  const response = await client.channels.list({
    part: ['snippet', 'statistics', 'contentDetails'],
    mine: true,
  });

  return response.data.items?.[0];
}

export async function getVideoAnalytics(accessToken: string, videoId: string) {
  const client = getYouTubeClient(accessToken);
  const response = await client.videos.list({
    part: ['statistics', 'snippet'],
    id: [videoId],
  });

  return response.data.items?.[0];
}

export async function uploadVideo(
  accessToken: string,
  videoPath: string,
  metadata: {
    title: string;
    description: string;
    tags?: string[];
    categoryId?: string;
    privacyStatus: string;
  }
) {
  const client = getYouTubeClient(accessToken);
  if (!['private', 'unlisted', 'public'].includes(metadata.privacyStatus)) {
    throw new Error('Invalid YouTube privacy status');
  }

  // This is a simplified version - in production, you'd use resumable uploads
  const response = await client.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: metadata.title,
        description: metadata.description,
        tags: metadata.tags,
        categoryId: metadata.categoryId,
      },
      status: {
          privacyStatus: metadata.privacyStatus as 'private' | 'unlisted' | 'public',
      },
    },
    media: {
      body: createReadStream(videoPath),
    },
  });

  return response.data;
}

export async function searchYouTube(query: string, apiKey: string) {
  const response = await youtube.search.list({
    key: apiKey,
    part: ['snippet'],
    q: query,
    type: ['video'],
    maxResults: 10,
  });

  return response.data.items || [];
}
