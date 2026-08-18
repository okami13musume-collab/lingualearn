import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const content = (formData.get('content') as string) || '';
    const targetLang = (formData.get('targetLang') as string) || 'Spanish';

    if (!content.trim()) {
      return NextResponse.json({ error: 'No content' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key missing' }, { status: 500 });
    }

    const prompt = `Create a course from this vocabulary:
${content.substring(0, 500)}

Return JSON: {"courseTitle":"Course","units":[{"title":"U1","description":"D","lessons":[{"title":"L1","exercises":[{"type":"mcq","question":"Q1?","options":["A","B","C"],"answer":"A"}]}]}]}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
      body: JSON.stringify({
        model: 'claude-opus-4-20250219',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json() as any;
    
    if (!response.ok) {
      console.error('API error:', data);
      throw new Error(`API returned ${response.status}: ${JSON.stringify(data)}`);
    }

    let courseData = null;
    try {
      const text = data.content?.[0]?.text || '';
      courseData = JSON.parse(text);
    } catch (e) {
      console.error('Parse error, text was:', data.content?.[0]?.text);
    }

    return NextResponse.json({
      success: true,
      courseId: uuidv4(),
      courseData: courseData || { courseTitle: targetLang, units: [] },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
