import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const targetLang = (formData.get('targetLang') as string) || 'Russian';

    const courseData = {
      courseTitle: `${targetLang} Vocabulary Mastery`,
      units: [
        {
          title: "Unit 1: Food & Drinks",
          description: "Learn essential food vocabulary",
          lessons: [
            {
              title: "Lesson 1: Vegetables & Fruits",
              exercises: [
                { type: "mcq", question: "What is 'овощи'?", options: ["Vegetables", "Fruit", "Bread"], answer: "Vegetables", explanation: "овощи means vegetables" },
                { type: "mcq", question: "What is 'фрукты'?", options: ["Vegetables", "Fruit", "Meat"], answer: "Fruit", explanation: "фрукты means fruit" },
                { type: "fill", question: "Type the word for banana", answer: "банан", hint: "Starts with б" }
              ]
            },
            {
              title: "Lesson 2: Dairy & Proteins",
              exercises: [
                { type: "mcq", question: "What is 'молоко'?", options: ["Juice", "Milk", "Water"], answer: "Milk", explanation: "молоко means milk" },
                { type: "mcq", question: "What is 'сыр'?", options: ["Butter", "Cheese", "Bread"], answer: "Cheese", explanation: "сыр means cheese" },
                { type: "flash", front: "яйца", back: "eggs" }
              ]
            }
          ]
        },
        {
          title: "Unit 2: Beverages & Meals",
          description: "Learn drinks and dishes",
          lessons: [
            {
              title: "Lesson 1: Drinks",
              exercises: [
                { type: "mcq", question: "What is 'кофе'?", options: ["Tea", "Coffee", "Water"], answer: "Coffee", explanation: "кофе means coffee" },
                { type: "mcq", question: "What is 'чай'?", options: ["Coffee", "Tea", "Juice"], answer: "Tea", explanation: "чай means tea" },
                { type: "fill", question: "Type the word for water", answer: "вода", hint: "Starts with в" }
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
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
