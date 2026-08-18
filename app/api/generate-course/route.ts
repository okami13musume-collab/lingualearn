import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const targetLang = (formData.get('targetLang') as string) || 'Spanish';

    const courseData = {
      courseTitle: `${targetLang} Fundamentals`,
      units: [
        {
          title: "Unit 1: Basics",
          description: "Learn essential words and phrases",
          lessons: [
            {
              title: "Lesson 1: Greetings",
              exercises: [
                {
                  type: "mcq",
                  question: `How do you say "hello" in ${targetLang}?`,
                  options: ["Goodbye", "Hello", "Thank you"],
                  answer: "Hello",
                  explanation: "This is the greeting word"
                },
                {
                  type: "mcq",
                  question: `What means "thank you" in ${targetLang}?`,
                  options: ["Please", "Thank you", "Goodbye"],
                  answer: "Thank you",
                  explanation: "Used to express gratitude"
                }
              ]
            }
          ]
        }
      ]
    };

    return NextResponse.json({
      success: true,
      courseId: uuidv4(),
      courseData,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to generate course' },
      { status: 500 }
    );
  }
}
