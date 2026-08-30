import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/supabase';
import { prisma } from '@/lib/db/prisma';

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
    console.error('Projects error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch projects' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { name, channelId } = body;

    const project = await prisma.project.create({
      data: {
        userId: user.id,
        name,
        channelId,
      },
    });

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error('Project create error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create project' } },
      { status: 500 }
    );
  }
}
