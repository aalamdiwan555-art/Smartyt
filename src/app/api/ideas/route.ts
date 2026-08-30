import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/supabase';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const ideas = await prisma.idea.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: { ideas } });
  } catch (error) {
    console.error('Ideas error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch ideas' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { titleConcept, contentAngle, hook, targetAudience, suggestedKeywords, thumbnailConcept, projectId } = body;

    const idea = await prisma.idea.create({
      data: {
        userId: user.id,
        projectId: projectId || null,
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
    console.error('Idea create error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create idea' } },
      { status: 500 }
    );
  }
}
