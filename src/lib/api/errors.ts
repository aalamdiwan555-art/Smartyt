import { NextResponse } from 'next/server';

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized');
    this.name = 'UnauthorizedError';
  }
}

export function handleApiError(error: unknown, message: string) {
  if (error instanceof UnauthorizedError || (error instanceof Error && error.message === 'Unauthorized')) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication is required' } },
      { status: 401 },
    );
  }

  console.error(message, error);
  return NextResponse.json(
    { success: false, error: { code: 'INTERNAL_ERROR', message } },
    { status: 500 },
  );
}