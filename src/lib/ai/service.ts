import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPTS: Record<string, string> = {
  idea: `You are Smartyt AI, an expert YouTube content strategist. Generate creative, engaging video ideas based on the creator's Content DNA. 
Return a JSON object with: { titleConcept, contentAngle, hook, targetAudience, suggestedKeywords: string[], thumbnailConcept }`,

  title: `You are Smartyt AI, a YouTube title optimization expert. Generate compelling, click-worthy titles that are SEO-friendly.
Return a JSON object with: { titles: string[], scores: number[] }`,

  description: `You are Smartyt AI, a YouTube description expert. Write SEO-optimized descriptions with natural keyword placement.
Return a JSON object with: { description, chapters, cta, socialLinks }`,

  script: `You are Smartyt AI, a professional YouTube scriptwriter. Create engaging scripts with strong hooks and clear structure.
Return a JSON object with: { hook, introduction, mainSections: string[], examples: string[], cta, ending }`,

  hashtags: `You are Smartyt AI, a social media hashtag strategist. Generate relevant, trending hashtags.
Return a JSON object with: { hashtags: string[], categories: { broad: string[], niche: string[], topic: string[] } }`,

  tags: `You are Smartyt AI, a YouTube SEO expert. Generate relevant video tags.
Return a JSON object with: { tags: string[] }`,

  thumbnail_concept: `You are Smartyt AI, a thumbnail design strategist. Create compelling thumbnail concepts.
Return a JSON object with: { concept, textSuggestions: string[], layout, visualHierarchy, backgroundConcept }`,

  hook: `You are Smartyt AI, a YouTube hook specialist. Create attention-grabbing video hooks.
Return a JSON object with: { hooks: string[], types: string[] }`,
};

type GenerationType = keyof typeof SYSTEM_PROMPTS;

function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not configured');
  return new Anthropic({ apiKey });
}

export async function generateWithAI(type: GenerationType, input: Record<string, unknown>, contentDNA?: Record<string, unknown>) {
  const systemPrompt = SYSTEM_PROMPTS[type];

  const userPrompt = `Content DNA: ${JSON.stringify(contentDNA || {})}

Input: ${JSON.stringify(input)}

Generate the requested content. Return ONLY valid JSON.`;

  try {
    const response = await getAnthropicClient().messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';

    // Extract JSON from response
    const fenced = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1];
    const jsonText = fenced || content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1);
    if (jsonText.startsWith('{') && jsonText.endsWith('}')) return JSON.parse(jsonText);

    return { raw: content };
  } catch (error) {
    console.error('AI generation error:', error);
    throw new Error('Failed to generate content');
  }
}

export async function generateChatResponse(messages: { role: 'user' | 'assistant'; content: string }[], contentDNA?: Record<string, unknown>) {
  const systemPrompt = `You are Smartyt AI, an expert YouTube creator assistant. Help creators with their content strategy, optimization, and growth. Be concise, actionable, and encouraging. Content DNA: ${JSON.stringify(contentDNA || {})}`;

  try {
    const response = await getAnthropicClient().messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1500,
      system: systemPrompt,
      messages,
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  } catch (error) {
    console.error('Chat response error:', error);
    throw new Error('Failed to generate response');
  }
}
