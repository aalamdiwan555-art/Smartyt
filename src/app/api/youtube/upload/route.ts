import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/supabase';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const formData = await request.formData();
    const draftId = formData.get('draftId') as string;
    const videoFile = formData.get('video') as File;

    if (!draftId || !videoFile) {
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

    const upload = await prisma.upload.create({
      data: {
        draftId,
        userId: user.id,
        uploadStatus: 'uploading',
        progressPercent: 0,
        startedAt: new Date(),
      },
    });

    await prisma.videoDraft.update({
      where: { id: draftId },
      data: { status: 'uploading' },
    });

    setTimeout(async () => {
      await prisma.upload.update({
        where: { id: upload.id },
        data: { progressPercent: 50 },
      });
    }, 2000);

    setTimeout(async () => {
      await prisma.upload.update({
        where: { id: upload.id },
        data: { 
          progressPercent: 100,
          uploadStatus: 'succeeded',
          completedAt: new Date(),
        },
      });

      await prisma.videoDraft.update({
        where: { id: draftId },
        data: { status: 'published' },
      });
    }, 4000);

    return NextResponse.json({ 
      success: true, 
      data: { uploadId: upload.id, status: 'uploading' } 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to upload video' } },
      { status: 500 }
    );
  }
}
