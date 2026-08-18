import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const content = formData.get('content') as string;
    const nativeLang = formData.get('nativeLang') as string;
    const targetLang = formData.get('targetLang') as string;
    const difficulty = formData.get('difficulty') as string;
    const exerciseTypes = JSON.parse(formData.get('exerciseTypes') as string);

    if (!content?.trim()) {
      return NextResponse.json({ error: 'No content' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key missing' }, { status: 500 });
    }

    const shortTypes = exerciseTypes.slice(0, 5).join(', ');
    const shortContent = content.substring(0, 800);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-20250805',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: `Create a ${targetLang} language course for ${difficulty} level learners speaking ${nativeLang}. Use content: "${shortContent}". Return JSON with courseTitle, and 3 units with 2 lessons each. Each lesson has 2 exercises of types: ${shortTypes}. Only return raw JSON.`
        }],
      }),
    });

    const data = await response.json() as any;
    const text = data.content?.[0]?.text || '{}';
    const courseData = JSON.parse(text.replace(/```json|```/g, '').trim());

    return NextResponse.json({
      success: true,
      courseId: uuidv4(),
      courseData,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}