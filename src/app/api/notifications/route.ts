import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/supabase';
import { prisma } from '@/lib/db/prisma';
import { handleApiError } from '@/lib/api/errors';
import { notificationInputSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ success: true, data: { notifications } });
  } catch (error) {
    return handleApiError(error, 'Failed to fetch notifications');
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();

    const parsed = notificationInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Notification ID is required' } },
        { status: 400 },
      );
    }

    const result = await prisma.notification.updateMany({
      where: { id: parsed.data.notificationId, userId: user.id },
      data: { read: true },
    });
    if (result.count === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Notification not found' } },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, 'Failed to update notification');
  }
}
