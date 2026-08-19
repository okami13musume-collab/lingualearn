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

    if (vocabPairs.length === 0) {
      return NextResponse.json({ error: 'No valid vocabulary found' }, { status: 400 });
    }

    // Create lessons with 10 questions each
    const questionsPerLesson = 10;
    const lessons = [];
    
    let questionIndex = 0;
    while (questionIndex < vocabPairs.length) {
      const exercisesForLesson = [];
      
      // Create 10 questions for this lesson
      for (let i = 0; i < questionsPerLesson && questionIndex < vocabPairs.length; i++) {
        const currentPair = vocabPairs[questionIndex % vocabPairs.length];
        
        if (i % 2 === 0) {
          // MCQ exercise
          const wrongAnswers = vocabPairs
            .filter((_, idx) => idx !== (questionIndex % vocabPairs.length))
            .slice(0, 2)
            .map(p => p.translation);
          
          const options = [currentPair.translation, ...wrongAnswers].sort(() => Math.random() - 0.5);
          
          exercisesForLesson.push({
            type: 'mcq',
            question: `What does "${currentPair.word}" mean?`,
            options,
            answer: currentPair.translation,
            explanation: `${currentPair.word} = ${currentPair.translation}`,
          });
        } else {
          // Fill in the blank exercise
          exercisesForLesson.push({
            type: 'fill',
            question: `Type the word for: ${currentPair.translation}`,
            answer: currentPair.word,
            hint: `Starts with ${currentPair.word[0]}`,
          });
        }
        
        questionIndex++;
      }
      
      lessons.push({
        title: `Lesson ${lessons.length + 1}`,
        exercises: exercisesForLesson,
      });
    }

    const courseData = {
      courseTitle: `${targetLang} Vocabulary`,
      units: [
        {
          title: 'Unit 1: Your Vocabulary',
          description: `Learn ${vocabPairs.length} vocabulary words`,
          lessons,
        },
      ],
    };

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
