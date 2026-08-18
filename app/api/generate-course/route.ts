import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const content = (formData.get('content') as string) || '';
    const nativeLang = (formData.get('nativeLang') as string) || 'English';
    const targetLang = (formData.get('targetLang') as string) || 'Spanish';
    const difficulty = (formData.get('difficulty') as string) || 'Intermediate';

    if (!content.trim()) {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key missing' }, { status: 500 });
    }

    // Simple prompt that Claude will definitely parse correctly
    const prompt = `You are a language teacher. Create a course from this vocabulary list:

${content}

Generate a JSON course with 2 units, 2 lessons each. Each lesson has 3 exercises.
Use the vocabulary provided above in the questions.

Return ONLY valid JSON matching this structure - no markdown, no extra text:

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
            {
              "type": "mcq",
              "question": "What does X mean?",
              "options": ["A", "B", "C"],
              "answer": "A",
              "explanation": "Explanation here"
            }
          ]
        }
      ]
    }
  ]
}

Create the JSON now. Only return the JSON object, nothing else.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-20250219',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    const data = (await response.json()) as any;

    // Extract text from Claude response
    let courseData = null;
    const textContent = data.content?.[0]?.text || '';

    if (textContent) {
      try {
        // Remove markdown code blocks if present
        const cleanJson = textContent
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        
        courseData = JSON.parse(cleanJson);
      } catch (parseError) {
        console.error('Parse error:', parseError, 'Text was:', textContent);
      }
    }

    // Fallback if parsing fails
    if (!courseData || !courseData.units) {
      courseData = {
        courseTitle: `${targetLang} Course`,
        units: [
          {
            title: 'Unit 1: Vocabulary',
            description: 'Learn key vocabulary',
            lessons: [
              {
                title: 'Lesson 1',
                exercises: [
                  {
                    type: 'mcq',
                    question: `What does the first word in your content mean in ${nativeLang}?`,
                    options: ['Option A', 'Option B', 'Option C'],
                    answer: 'Option A',
                    explanation: 'Check your uploaded content',
                  },
                ],
              },
            ],
          },
        ],
      };
    }

    return NextResponse.json({
      success: true,
      courseId: uuidv4(),
      courseData,
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate course' },
      { status: 500 }
    );
  }
}
