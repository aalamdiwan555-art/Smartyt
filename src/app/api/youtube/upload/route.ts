import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { unlink, writeFile } from 'node:fs/promises';
import { requireAuth } from '@/lib/auth/supabase';
import { prisma } from '@/lib/db/prisma';
import { handleApiError } from '@/lib/api/errors';
import { decryptSecret } from '@/lib/security/encryption';
import { uploadVideo } from '@/lib/youtube/service';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const formData = await request.formData();
    const draftIdValue = formData.get('draftId');
    const videoFile = formData.get('video');
    const draftId = typeof draftIdValue === 'string' ? draftIdValue : '';

    if (!draftId || !videoFile || typeof videoFile !== 'object' || typeof (videoFile as File).arrayBuffer !== 'function') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Draft ID and video file are required' } },
        { status: 400 }
      );
    }

    const draft = await prisma.videoDraft.findFirst({
      where: { id: draftId, userId: user.id },
      include: { channel: true },
    });

    if (!draft) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Draft not found' } },
        { status: 404 }
      );
    }

    if (!draft.channelId) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_CHANNEL', message: 'No channel connected to this draft' } },
        { status: 400 }
      );
    }

    const file = videoFile as File;
    const maxBytes = 512 * 1024 * 1024;
    if (!file.type.startsWith('video/') || file.size <= 0 || file.size > maxBytes) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Video must be a non-empty file no larger than 512 MB' } },
        { status: 400 },
      );
    }
    if (!draft.title?.trim()) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Add a title to the draft before uploading' } },
        { status: 400 },
      );
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: 'active',
        OR: [{ currentPeriodEnd: null }, { currentPeriodEnd: { gt: new Date() } }],
      },
      orderBy: { updatedAt: 'desc' },
    });
    const uploadLimit = subscription?.plan === 'team' ? 100 : subscription?.plan === 'pro' ? 20 : 1;
    const periodStart = new Date();
    periodStart.setUTCHours(0, 0, 0, 0);
    const usage = await prisma.usage.upsert({
      where: { userId_periodStart: { userId: user.id, periodStart } },
      update: {},
      create: { userId: user.id, periodStart },
    });
    const reservation = await prisma.usage.updateMany({
      where: { id: usage.id, uploadsUsed: { lt: uploadLimit } },
      data: { uploadsUsed: { increment: 1 } },
    });
    if (reservation.count === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'USAGE_LIMIT_EXCEEDED', message: 'Upload limit reached. Upgrade your plan.' } },
        { status: 429 },
      );
    }

    const connection = await prisma.oAuthConnection.findFirst({
      where: { userId: user.id, channelId: draft.channelId, provider: 'google' },
      orderBy: { createdAt: 'desc' },
    });
    if (!connection) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_OAUTH_CONNECTION', message: 'Reconnect your YouTube channel before uploading' } },
        { status: 400 },
      );
    }

    const upload = await prisma.upload.create({
      data: {
        draftId,
        userId: user.id,
        uploadStatus: 'uploading',
        progressPercent: 0,
        startedAt: new Date(),
      },
    });

    const tempPath = join(tmpdir(), `smartyt-${randomUUID()}.upload`);
    await prisma.videoDraft.update({ where: { id: draftId }, data: { status: 'uploading' } });
    try {
      await writeFile(tempPath, Buffer.from(await file.arrayBuffer()));
      const uploaded = await uploadVideo(decryptSecret(connection.accessTokenEncrypted), tempPath, {
        title: draft.title,
        description: draft.description || '',
        tags: draft.tags,
        categoryId: draft.categoryId || undefined,
        privacyStatus: draft.visibility,
      });
      await prisma.$transaction([
        prisma.upload.update({
          where: { id: upload.id },
          data: {
            youtubeVideoId: uploaded.id || null,
            progressPercent: 100,
            uploadStatus: 'succeeded',
            completedAt: new Date(),
          },
        }),
        prisma.videoDraft.update({ where: { id: draftId }, data: { status: 'published' } }),
      ]);
    } catch (error) {
      await prisma.$transaction([
        prisma.upload.update({
          where: { id: upload.id },
          data: {
            uploadStatus: 'failed',
            errorMessage: error instanceof Error ? error.message.slice(0, 500) : 'YouTube upload failed',
          },
        }),
        prisma.videoDraft.update({ where: { id: draftId }, data: { status: 'failed' } }),
      ]);
      throw error;
    } finally {
      await unlink(tempPath).catch(() => undefined);
    }

    return NextResponse.json({ 
      success: true, 
      data: { uploadId: upload.id, status: 'succeeded' } 
    });
  } catch (error) {
    return handleApiError(error, 'Failed to upload video');
  }
}
