import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const content = (formData.get('content') as string) || '';
    const nativeLang = (formData.get('nativeLang') as string) || 'English';
    const targetLang = (formData.get('targetLang') as string) || 'Spanish';

    if (!content.trim()) {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key missing' }, { status: 500 });
    }

    const client = new Anthropic({ apiKey });

    const prompt = `Create a language learning course from this vocabulary:

${content}

Return ONLY this JSON structure (no markdown, no extra text):
{
  "courseTitle": "Vocabulary Course",
  "units": [
    {
      "title": "Unit 1",
      "description": "Learn vocabulary",
      "lessons": [
        {
          "title": "Lesson 1",
          "exercises": [
            {"type": "mcq", "question": "What does X mean?", "options": ["A", "B", "C"], "answer": "A", "explanation": "Because..."}
          ]
        }
      ]
    }
  ]
}`;

    const message = await client.messages.create({
      model: 'claude-opus-4-20250219',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    let courseData = null;
    const textContent = message.content[0];

    if (textContent && textContent.type === 'text') {
      try {
        const cleanJson = textContent.text
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        
        courseData = JSON.parse(cleanJson);
      } catch (parseError) {
        console.error('Parse failed:', parseError);
      }
    }

    if (!courseData?.units) {
      return NextResponse.json({
        success: true,
        courseId: uuidv4(),
        courseData: {
          courseTitle: `${targetLang} Course`,
          units: [{
            title: 'Unit 1',
            description: 'Course content',
            lessons: [{
              title: 'Lesson 1',
              exercises: [{
                type: 'mcq',
                question: 'Your course is being generated',
                options: ['Please try again', 'Refresh page', 'Check console'],
                answer: 'Please try again',
              }],
            }],
          }],
        },
      });
    }

    return NextResponse.json({
      success: true,
      courseId: uuidv4(),
      courseData,
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({
      error: `Error: ${error.message}`,
    }, { status: 500 });
  }
}
