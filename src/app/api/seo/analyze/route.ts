import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/supabase';

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();
    const { title, description, tags } = body;

    const scores = {
      title: calculateTitleScore(title),
      description: calculateDescriptionScore(description),
      keywords: calculateKeywordScore(title, description, tags),
      metadata: calculateMetadataScore(title, description, tags),
    };

    const overall = Math.round((scores.title + scores.description + scores.keywords + scores.metadata) / 4);
    const suggestions = generateSuggestions(scores, title, description, tags);

    return NextResponse.json({
      success: true,
      data: {
        overall,
        ...scores,
        suggestions,
        assessment_type: 'smartyt_assessment',
      },
    });
  } catch (error) {
    console.error('SEO analyze error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to analyze SEO' } },
      { status: 500 }
    );
  }
}

function calculateTitleScore(title?: string): number {
  if (!title) return 0;
  let score = 50;
  if (title.length >= 30 && title.length <= 60) score += 20;
  if (title.length < 30) score += 10;
  if (/[A-Z]/.test(title[0])) score += 10;
  if (/[0-9]/.test(title)) score += 10;
  if (title.includes('?') || title.includes('!')) score += 10;
  return Math.min(100, score);
}

function calculateDescriptionScore(description?: string): number {
  if (!description) return 0;
  let score = 50;
  if (description.length >= 200) score += 20;
  if (description.includes('http')) score += 10;
  if (description.includes('#')) score += 10;
  if (description.split('\n').length >= 3) score += 10;
  return Math.min(100, score);
}

function calculateKeywordScore(title?: string, description?: string, tags?: string[]): number {
  let score = 50;
  if (title && description) {
    const titleWords = title.toLowerCase().split(' ');
    const descWords = description.toLowerCase().split(' ');
    const overlap = titleWords.filter(w => descWords.includes(w)).length;
    score += Math.min(30, overlap * 5);
  }
  if (tags && tags.length >= 5) score += 20;
  return Math.min(100, score);
}

function calculateMetadataScore(title?: string, description?: string, tags?: string[]): number {
  let score = 50;
  if (title) score += 15;
  if (description) score += 15;
  if (tags && tags.length > 0) score += 10;
  if (description && description.length > 100) score += 10;
  return Math.min(100, score);
}

function generateSuggestions(scores: any, title?: string, description?: string, tags?: string[]): string[] {
  const suggestions = [];

  if (scores.title < 70) {
    if (!title || title.length < 30) suggestions.push('Title is too short. Aim for 30-60 characters.');
    if (title && title.length > 60) suggestions.push('Title is too long. Keep it under 60 characters.');
    suggestions.push('Add numbers or questions to make your title more engaging.');
  }

  if (scores.description < 70) {
    suggestions.push('Description should be at least 200 characters for better SEO.');
    suggestions.push('Add timestamps or chapters to improve viewer experience.');
  }

  if (scores.keywords < 70) {
    suggestions.push('Use at least 5-8 relevant tags.');
    suggestions.push('Include your main keyword in both title and description.');
  }

  if (scores.metadata < 70) {
    suggestions.push('Complete all metadata fields for better discoverability.');
  }

  return suggestions.slice(0, 5);
}
