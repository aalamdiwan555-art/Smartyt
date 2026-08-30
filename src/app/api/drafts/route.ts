import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/supabase';
import { prisma } from '@/lib/db/prisma';
import { handleApiError } from '@/lib/api/errors';
import { draftInputSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const drafts = await prisma.videoDraft.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: { drafts } });
  } catch (error) {
    return handleApiError(error, 'Failed to fetch drafts');
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const parsed = draftInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Invalid draft details' } },
        { status: 400 },
      );
    }
    const { title, description, tags, projectId, channelId } = parsed.data;

    if (projectId) {
      const project = await prisma.project.findFirst({ where: { id: projectId, userId: user.id } });
      if (!project) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } },
          { status: 404 },
        );
      }
    }
    if (channelId) {
      const channel = await prisma.youTubeChannel.findFirst({ where: { id: channelId, userId: user.id } });
      if (!channel) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Channel not found' } },
          { status: 404 },
        );
      }
    }

    const draft = await prisma.videoDraft.create({
      data: {
        userId: user.id,
        projectId: projectId || null,
        channelId: channelId || null,
        title,
        description,
        tags: tags || [],
        status: 'draft',
      },
    });

    return NextResponse.json({ success: true, data: draft });
  } catch (error) {
    return handleApiError(error, 'Failed to create draft');
  }
}
