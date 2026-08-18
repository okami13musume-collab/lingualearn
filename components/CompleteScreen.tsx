'use client';

import styles from './CompleteScreen.module.css';

interface CompleteScreenProps {
  correctCount: number;
  totalExercises: number;
  xpEarned: number;
  timeSpent?: number;
  onContinue: () => void;
}

export default function CompleteScreen({
  correctCount,
  totalExercises,
  xpEarned,
  timeSpent = 105,
  onContinue,
}: CompleteScreenProps) {
  const accuracy = Math.round((correctCount / totalExercises) * 100);
  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.icon}>🏆</div>
        <h2>Lesson complete!</h2>
      </div>

      <div className={styles.stats}>
        <div className={styles.statBox}>
          <div className={styles.statValue}>+{xpEarned}</div>
          <div className={styles.statLabel}>XP earned</div>
        </div>
        <div className={styles.statBox}>
          <div className={styles.statValue}>{accuracy}%</div>
          <div className={styles.statLabel}>Accuracy</div>
        </div>
        <div className={styles.statBox}>
          <div className={styles.statValue}>
            {minutes}:{seconds < 10 ? '0' : ''}
            {seconds}
          </div>
          <div className={styles.statLabel}>Time</div>
        </div>
      </div>

      <button className={styles.continueBtn} onClick={onContinue}>
        Continue
        <i className="ti ti-arrow-right"></i>
      </button>
    </div>
  );
}
