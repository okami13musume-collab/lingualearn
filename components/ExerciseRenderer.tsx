'use client';

import { useState } from 'react';
import styles from './ExerciseRenderer.module.css';

interface ExerciseRendererProps {
  exercise: any;
  onCheckAnswer: (isCorrect: boolean) => void;
}

export default function ExerciseRenderer({
  exercise,
  onCheckAnswer,
}: ExerciseRendererProps) {
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [fillAnswer, setFillAnswer] = useState('');

  if (exercise.type === 'mcq') {
    return (
      <div>
        <h3 className={styles.question}>{exercise.question}</h3>
        <div className={styles.mcqOptions}>
          {(exercise.options || []).map((option: string, idx: number) => (
            <button
              key={idx}
              className={`${styles.mcqOption} ${
                selectedAnswer === option ? styles.selected : ''
              } ${
                answered
                  ? option === exercise.answer
                    ? styles.correct
                    : selectedAnswer === option
                    ? styles.wrong
                    : ''
                  : ''
              }`}
              onClick={() => {
                if (answered) return;
                const isCorrect = option === exercise.answer;
                setSelectedAnswer(option);
                setAnswered(true);
                setTimeout(() => onCheckAnswer(isCorrect), 500);
              }}
              disabled={answered}
            >
              <span className={styles.letter}>{String.fromCharCode(65 + idx)}</span>
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (exercise.type === 'fill') {
    return (
      <div>
        <h3 className={styles.question}>{exercise.question}</h3>
        <input
          type="text"
          placeholder="Type your answer…"
          value={fillAnswer}
          onChange={(e) => setFillAnswer(e.target.value)}
          className={styles.textInput}
          disabled={answered}
        />
        <button
          className={styles.checkBtn}
          onClick={() => {
            const isCorrect = fillAnswer.toLowerCase().trim() === exercise.answer.toLowerCase().trim();
            setAnswered(true);
            setTimeout(() => onCheckAnswer(isCorrect), 500);
          }}
          disabled={answered}
        >
          {answered ? 'Next' : 'Submit'}
        </button>
      </div>
    );
  }

  if (exercise.type === 'flash') {
    return (
      <div>
        <h3 className={styles.question}>Flashcard</h3>
        <div className={styles.flashcard} onClick={() => setAnswered(!answered)}>
          <div className={styles.cardFront}>{exercise.front}</div>
          {answered && <div className={styles.cardBack}>{exercise.back}</div>}
        </div>
        {answered && (
          <button className={styles.checkBtn} onClick={() => onCheckAnswer(true)}>
            Got it! Continue
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <h3 className={styles.question}>{exercise.question || 'Exercise'}</h3>
      <button className={styles.checkBtn} onClick={() => onCheckAnswer(true)}>
        Submit Answer
      </button>
    </div>
  );
}
