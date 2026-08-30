import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/supabase';
import { prisma } from '@/lib/db/prisma';
import { handleApiError } from '@/lib/api/errors';
import { toJsonSafe } from '@/lib/api/response';
import { onboardingInputSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const parsed = onboardingInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Please complete the onboarding details' } },
        { status: 400 },
      );
    }

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...parsed.data, onboardingCompleted: true },
      update: { ...parsed.data, onboardingCompleted: true },
    });

    return NextResponse.json(toJsonSafe({ success: true, data: { profile } }));
  } catch (error) {
    return handleApiError(error, 'Failed to save profile');
  }
}