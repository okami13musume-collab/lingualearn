import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const content = formData.get('content') as string;
    const nativeLang = formData.get('nativeLang') as string;
    const targetLang = formData.get('targetLang') as string;

    if (!content?.trim()) {
      return NextResponse.json({ error: 'No content' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key missing' }, { status: 500 });
    }

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
        messages: [{
          role: 'user',
          content: `Create a ${targetLang} learning course. Return ONLY this JSON (no extra text):
{"courseTitle":"${targetLang} Basics","units":[{"title":"Unit 1","description":"Introduction","lessons":[{"title":"Lesson 1","exercises":[{"type":"mcq","question":"What does 'hello' mean in ${targetLang}?","options":["Goodbye","Hello","Thank you"],"answer":"Hello"},{"type":"mcq","question":"Test 2","options":["A","B","C"],"answer":"A"}]}]},{"title":"Unit 2","description":"Advanced","lessons":[{"title":"Lesson 1","exercises":[{"type":"mcq","question":"Advanced Q1","options":["X","Y","Z"],"answer":"X"},{"type":"mcq","question":"Q2","options":["1","2","3"],"answer":"1"}]}]}]}`
        }],
      }),
    });

    const data = await response.json() as any;
    let courseData = {};
    
    try {
      const text = data.content?.[0]?.text || '{}';
      courseData = JSON.parse(text);
    } catch (e) {
      courseData = {
        courseTitle: "Course",
        units: [{
          title: "Unit 1",
          description: "Sample",
          lessons: [{
            title: "Lesson 1",
            exercises: [{
              type: "mcq",
              question: "Sample question",
              options: ["A", "B", "C"],
              answer: "A"
            }]
          }]
        }]
      };
    }

    return NextResponse.json({
      success: true,
      courseId: uuidv4(),
      courseData,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}