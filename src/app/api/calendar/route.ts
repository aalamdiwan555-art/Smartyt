import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/supabase';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    const items = await prisma.contentCalendar.findMany({
      where: { userId: user.id },
      orderBy: { scheduledDate: 'asc' },
    });

    return NextResponse.json({ success: true, data: { items } });
  } catch (error) {
    console.error('Calendar error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch calendar' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { title, scheduledDate, type, draftId } = body;

    const item = await prisma.contentCalendar.create({
      data: {
        userId: user.id,
        title,
        scheduledDate: new Date(scheduledDate),
        type,
        draftId,
      },
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('Calendar create error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create calendar item' } },
      { status: 500 }
    );
  }
}
