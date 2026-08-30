import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/supabase';
import { prisma } from '@/lib/db/prisma';
import { handleApiError } from '@/lib/api/errors';
import { projectInputSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      include: {
        ideas: true,
        videoDrafts: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: { projects } });
  } catch (error) {
    return handleApiError(error, 'Failed to fetch projects');
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const parsed = projectInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'A valid project name is required' } },
        { status: 400 },
      );
    }
    const { name, channelId } = parsed.data;
    if (channelId) {
      const channel = await prisma.youTubeChannel.findFirst({ where: { id: channelId, userId: user.id } });
      if (!channel) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Channel not found' } },
          { status: 404 },
        );
      }
    }

    const project = await prisma.project.create({
      data: {
        userId: user.id,
        name,
        channelId,
      },
    });

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    return handleApiError(error, 'Failed to create project');
  }
}
