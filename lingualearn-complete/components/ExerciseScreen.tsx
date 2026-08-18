'use client';

import ExerciseRenderer from './ExerciseRenderer';
import styles from './ExerciseScreen.module.css';

interface ExerciseScreenProps {
  exercises: any[];
  currentExIdx: number;
  lives: number;
  onCheckAnswer: (isCorrect: boolean) => void;
  onClose: () => void;
}

export default function ExerciseScreen({
  exercises,
  currentExIdx,
  lives,
  onCheckAnswer,
  onClose,
}: ExerciseScreenProps) {
  const currentExercise = exercises[currentExIdx];
  const progress = ((currentExIdx + 1) / exercises.length) * 100;

  if (!currentExercise) {
    return <div>No exercise data</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.closeBtn} onClick={onClose}>
          <i className="ti ti-x"></i>
        </button>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
        </div>
        <div className={styles.lives}>
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={styles.heart} style={{ opacity: i < lives ? 1 : 0.25 }}>
              ❤️
            </span>
          ))}
        </div>
      </div>

      <div className={styles.body}>
        <ExerciseRenderer exercise={currentExercise} onCheckAnswer={onCheckAnswer} />
      </div>
    </div>
  );
}
