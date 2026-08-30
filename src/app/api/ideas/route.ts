import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/supabase';
import { prisma } from '@/lib/db/prisma';
import { handleApiError } from '@/lib/api/errors';
import { ideaInputSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const ideas = await prisma.idea.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: { ideas } });
  } catch (error) {
    return handleApiError(error, 'Failed to fetch ideas');
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const parsed = ideaInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Invalid idea details' } },
        { status: 400 },
      );
    }
    const { titleConcept, contentAngle, hook, targetAudience, suggestedKeywords, thumbnailConcept, projectId } = parsed.data;
    const project = await prisma.project.findFirst({ where: { id: projectId, userId: user.id } });
    if (!project) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } },
        { status: 404 },
      );
    }

    const idea = await prisma.idea.create({
      data: {
        userId: user.id,
        projectId,
        titleConcept,
        contentAngle,
        hook,
        targetAudience,
        suggestedKeywords: suggestedKeywords || [],
        thumbnailConcept,
        status: 'idea',
      },
    });

    return NextResponse.json({ success: true, data: idea });
  } catch (error) {
    return handleApiError(error, 'Failed to create idea');
  }
}
