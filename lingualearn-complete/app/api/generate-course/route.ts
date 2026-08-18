import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const content = formData.get('content') as string;
    const nativeLang = formData.get('nativeLang') as string;
    const targetLang = formData.get('targetLang') as string;
    const difficulty = formData.get('difficulty') as string;
    const exerciseTypes = JSON.parse(formData.get('exerciseTypes') as string);

    let contentText = content || '';

    if (!contentText.trim()) {
      return NextResponse.json(
        { error: 'No content provided' },
        { status: 400 }
      );
    }

    // Generate course using Claude
    const prompt = `You are a language learning course designer. A student wants to learn ${targetLang} (they speak ${nativeLang}). Their level is ${difficulty}.

Here is the content they provided:
"""
${contentText.substring(0, 4000)}
"""

Create a structured language course with 3 units, each containing 3 lessons (9 lessons total). Each lesson has exactly 4 exercises from these types: ${exerciseTypes.join(', ')}.

Respond ONLY with a valid JSON object. No markdown, no explanation. Format:
{
  "courseTitle": "short title based on content",
  "units": [
    {
      "title": "Unit title",
      "description": "brief description",
      "lessons": [
        {
          "title": "Lesson title",
          "exercises": [
            {
              "type": "mcq",
              "question": "What does '...' mean?",
              "options": ["A","B","C","D"],
              "answer": "A",
              "explanation": "Because..."
            },
            {
              "type": "fill",
              "question": "Complete: ___ means ...",
              "answer": "word",
              "hint": "hint text"
            },
            {
              "type": "flash",
              "front": "word",
              "back": "translation",
              "example": "usage example"
            },
            {
              "type": "match",
              "pairs": [["word1","trans1"],["word2","trans2"],["word3","trans3"],["word4","trans4"]]
            },
            {
              "type": "tf",
              "statement": "statement in ${targetLang}...",
              "answer": true,
              "explanation": "Because..."
            },
            {
              "type": "speak",
              "phrase": "phrase in ${targetLang}",
              "translation": "translation in ${nativeLang}",
              "tip": "pronunciation tip"
            },
            {
              "type": "listen",
              "transcript": "sentence in ${targetLang}",
              "question": "What did you hear?",
              "options": ["A","B","C","D"],
              "answer": "A"
            },
            {
              "type": "role",
              "scenario": "scenario",
              "aiRole": "character",
              "aiOpen": "opening line",
              "userPrompt": "prompt",
              "expectedTheme": "theme"
            },
            {
              "type": "write",
              "prompt": "Write a sentence",
              "wordBank": ["word1","word2","word3"],
              "example": "example"
            }
          ]
        }
      ]
    }
  ]
}

Only include exercise types from: ${exerciseTypes.join(', ')}. Each lesson must have exactly 4 exercises. Make exercises relevant to the content.`;

    const message = await client.messages.create({
      model: 'claude-opus-4-20250805',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    let courseJson = message.content
      .filter((block) => block.type === 'text')
      .map((block) => (block.type === 'text' ? block.text : ''))
      .join('');

    // Clean up JSON response
    courseJson = courseJson.replace(/```json|```/g, '').trim();

    const courseData = JSON.parse(courseJson);

    return NextResponse.json({
      success: true,
      courseId: uuidv4(),
      courseData,
    });
  } catch (error: any) {
    console.error('Course generation error:', error);
    return NextResponse.json(
      {
        error:
          error.message ||
          'Failed to generate course. Please check your API key and try again.',
      },
      { status: 500 }
    );
  }
}
