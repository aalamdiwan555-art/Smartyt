import { z } from 'zod';

const optionalText = (max: number) => z.string().trim().max(max).optional().nullable();
const id = z.string().trim().min(1).max(100);

export const draftInputSchema = z.object({
  title: optionalText(200),
  description: optionalText(10000),
  tags: z.array(z.string().trim().min(1).max(100)).max(30).default([]),
  projectId: id.optional().nullable(),
  channelId: id.optional().nullable(),
});

export const ideaInputSchema = z.object({
  titleConcept: optionalText(200),
  contentAngle: optionalText(5000),
  hook: optionalText(2000),
  targetAudience: optionalText(500),
  suggestedKeywords: z.array(z.string().trim().min(1).max(100)).max(30).default([]),
  thumbnailConcept: optionalText(2000),
  projectId: id,
});

export const projectInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  channelId: id.optional().nullable(),
});

export const calendarInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  scheduledDate: z.coerce.date(),
  type: z.enum(['video', 'short', 'idea', 'campaign']),
  draftId: id.optional().nullable(),
});

export const seoInputSchema = z.object({
  title: z.string().trim().max(200).default(''),
  description: z.string().trim().max(10000).default(''),
  tags: z.array(z.string().trim().min(1).max(100)).max(30).default([]),
});

export const keywordInputSchema = z.object({
  topic: z.string().trim().min(1).max(200),
});

export const aiInputSchema = z.object({
  type: z.enum(['idea', 'title', 'description', 'script', 'hashtags', 'tags', 'thumbnail_concept', 'hook']),
  input: z.record(z.unknown()),
  channelId: id.optional().nullable(),
});

export const onboardingInputSchema = z.object({
  creatorName: z.string().trim().min(1).max(120),
  mainLanguage: z.string().trim().min(2).max(10),
  targetAudience: z.string().trim().max(500).default(''),
  contentFormat: z.enum(['long_form', 'shorts', 'both']),
  mainTopics: z.array(z.string().trim().min(1).max(100)).max(20),
  goals: z.array(z.string().trim().min(1).max(100)).max(20),
});

export const notificationInputSchema = z.object({
  notificationId: id,
});