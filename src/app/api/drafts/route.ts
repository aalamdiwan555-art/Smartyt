import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/supabase';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const drafts = await prisma.videoDraft.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: { drafts } });
  } catch (error) {
    console.error('Drafts error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch drafts' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { title, description, tags, projectId, channelId } = body;

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
    console.error('Draft create error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create draft' } },
      { status: 500 }
    );
  }
}
