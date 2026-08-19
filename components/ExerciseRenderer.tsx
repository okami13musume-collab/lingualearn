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
  const [isCorrect, setIsCorrect] = useState(false);

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
                if (answered) {
                  onCheckAnswer(isCorrect);
                  return;
                }
                const correct = option === exercise.answer;
                setSelectedAnswer(option);
                setAnswered(true);
                setIsCorrect(correct);
                setTimeout(() => onCheckAnswer(correct), 500);
              }}
            >
              <span className={styles.letter}>{String.fromCharCode(65 + idx)}</span>
              {option}
            </button>
          ))}
        </div>
        {answered && (
          <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '14px', color: isCorrect ? '#0F6E56' : '#A32D2D' }}>
            {isCorrect ? '✓ Correct! Tap an answer to continue.' : '✗ Incorrect. Try again!'}
          </div>
        )}
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
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !answered) {
              const correct = fillAnswer.toLowerCase().trim() === exercise.answer.toLowerCase().trim();
              setAnswered(true);
              setIsCorrect(correct);
              setTimeout(() => onCheckAnswer(correct), 500);
            }
          }}
        />
        <button
          className={styles.checkBtn}
          onClick={() => {
            if (!answered) {
              const correct = fillAnswer.toLowerCase().trim() === exercise.answer.toLowerCase().trim();
              setAnswered(true);
              setIsCorrect(correct);
              setTimeout(() => onCheckAnswer(correct), 500);
            } else {
              onCheckAnswer(isCorrect);
            }
          }}
        >
          {answered ? (isCorrect ? '✓ Correct! Continue →' : '✗ Try again') : 'Submit'}
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
            Got it! Continue →
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
