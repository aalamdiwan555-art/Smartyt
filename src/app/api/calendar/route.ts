import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/supabase';
import { prisma } from '@/lib/db/prisma';
import { handleApiError } from '@/lib/api/errors';
import { calendarInputSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const where: { userId: string; scheduledDate?: { gte: Date; lt: Date } } = { userId: user.id };
    if (month !== null || year !== null) {
      const monthNumber = Number(month);
      const yearNumber = Number(year);
      if (!Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12 || !Number.isInteger(yearNumber) || yearNumber < 2000 || yearNumber > 2100) {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_INPUT', message: 'A valid month and year are required' } },
          { status: 400 },
        );
      }
      where.scheduledDate = {
        gte: new Date(Date.UTC(yearNumber, monthNumber - 1, 1)),
        lt: new Date(Date.UTC(yearNumber, monthNumber, 1)),
      };
    }

    const items = await prisma.contentCalendar.findMany({
      where,
      orderBy: { scheduledDate: 'asc' },
    });

    return NextResponse.json({ success: true, data: { items } });
  } catch (error) {
    return handleApiError(error, 'Failed to fetch calendar');
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const parsed = calendarInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Invalid calendar details' } },
        { status: 400 },
      );
    }
    const { title, scheduledDate, type, draftId } = parsed.data;
    if (Number.isNaN(scheduledDate.getTime())) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Invalid calendar date' } },
        { status: 400 },
      );
    }
    if (draftId) {
      const draft = await prisma.videoDraft.findFirst({ where: { id: draftId, userId: user.id } });
      if (!draft) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Draft not found' } },
          { status: 404 },
        );
      }
    }

    const item = await prisma.contentCalendar.create({
      data: {
        userId: user.id,
        title,
        scheduledDate,
        type,
        draftId: draftId ?? null,
      },
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    return handleApiError(error, 'Failed to create calendar item');
  }
}
