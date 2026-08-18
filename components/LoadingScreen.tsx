'use client';

import { useEffect, useState } from 'react';
import styles from './LoadingScreen.module.css';

interface LoadingScreenProps {
  progress: number;
}

const STEPS = [
  'Reading your content',
  'Identifying key vocabulary & concepts',
  'Designing lesson units',
  'Generating exercises',
  'Finalising your course',
];

export default function LoadingScreen({ progress }: LoadingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const newStep = Math.floor(progress / 20);
    setCurrentStep(Math.min(newStep, STEPS.length - 1));
  }, [progress]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.emoji}>🧠</div>
        <h2>Building your course…</h2>
        <p>Analysing your content and crafting personalised exercises</p>
      </div>

      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
        </div>
        <div className={styles.progressText}>{Math.round(progress)}%</div>
      </div>

      <div className={styles.steps}>
        {STEPS.map((step, idx) => (
          <div
            key={idx}
            className={`${styles.step} ${
              idx < currentStep ? styles.done : idx === currentStep ? styles.active : ''
            }`}
          >
            <i
              className={`ti ${
                idx < currentStep
                  ? 'ti-circle-check'
                  : idx === currentStep
                  ? 'ti-loader'
                  : 'ti-circle-dashed'
              }`}
            ></i>
            <span>{step}</span>
          </div>
        ))}
      </div>

      <p className={styles.hint}>
        This typically takes 15-30 seconds depending on content size.
      </p>
    </div>
  );
}
