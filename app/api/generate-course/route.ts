import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const content = (formData.get('content') as string) || '';
    const targetLang = (formData.get('targetLang') as string) || 'Spanish';

    if (!content.trim()) {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 });
    }

    // Parse vocabulary pairs from content
    const lines = content.split('\n').filter(line => line.trim());
    const vocabPairs = lines.map(line => {
      const [word, translation] = line.split('=').map(s => s.trim());
      return { word, translation };
    }).filter(pair => pair.word && pair.translation);

    // Create exercises from vocabulary
    const exercises = vocabPairs.slice(0, 4).map((pair, idx) => ({
      type: idx % 2 === 0 ? 'mcq' : 'fill',
      question: idx % 2 === 0 
        ? `What does "${pair.word}" mean?`
        : `Type the word for: ${pair.translation}`,
      options: idx % 2 === 0 ? [pair.translation, 'Wrong1', 'Wrong2'] : undefined,
      answer: pair.translation,
      hint: idx % 2 === 0 ? undefined : `Starts with ${pair.word[0]}`,
      explanation: idx % 2 === 0 ? `${pair.word} = ${pair.translation}` : undefined,
    }));

    const courseData = {
      courseTitle: `${targetLang} Vocabulary`,
      units: [
        {
          title: 'Unit 1: Your Vocabulary',
          description: 'Learn from your uploaded content',
          lessons: [
            {
              title: 'Lesson 1: Vocabulary Practice',
              exercises: exercises.length > 0 ? exercises : [{
                type: 'mcq',
                question: 'Learning vocabulary',
                options: ['Continue', 'Practice more', 'Review'],
                answer: 'Continue',
              }],
            },
          ],
        },
      ],
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
