'use client';

import styles from './MapScreen.module.css';

interface MapScreenProps {
  courseData: {
    courseTitle: string;
    units: Array<{
      title: string;
      description: string;
      lessons: Array<{
        title: string;
        exercises: any[];
      }>;
    }>;
  };
  totalXP: number;
  streak: number;
  unlockedLessons: Record<string, boolean | string>;
  onStartLesson: (unitIdx: number, lessonIdx: number) => void;
}

const TYPE_ICONS: Record<string, string> = {
  mcq: 'ti-list-check',
  fill: 'ti-text-size',
  flash: 'ti-cards',
  match: 'ti-arrows-join',
  tf: 'ti-toggle-left',
  speak: 'ti-microphone',
  listen: 'ti-headphones',
  role: 'ti-messages',
  write: 'ti-pencil',
};

export default function MapScreen({
  courseData,
  totalXP,
  streak,
  unlockedLessons,
  onStartLesson,
}: MapScreenProps) {
  const totalLessons = courseData.units.reduce((sum, u) => sum + u.lessons.length, 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.iconBadge}>
          <i className="ti ti-language"></i>
        </div>
        <div className={styles.headerInfo}>
          <h1>{courseData.courseTitle}</h1>
          <p>
            {courseData.units.length} units · {totalLessons} lessons
          </p>
        </div>
        <div className={styles.statsRow}>
          <div className={styles.statBadge}>
            <i className="ti ti-bolt"></i>
            <span>{totalXP} XP</span>
          </div>
          <div className={styles.streakBadge}>
            <i className="ti ti-flame"></i>
            <span>{streak}</span>
          </div>
        </div>
      </div>

      <div className={styles.unitList}>
        {courseData.units.map((unit, unitIdx) => (
          <div key={unitIdx} className={styles.unitCard}>
            <div className={styles.unitHeader}>
              <div className={styles.unitNumber}>{unitIdx + 1}</div>
              <div>
                <div className={styles.unitTitle}>{unit.title}</div>
                <div className={styles.unitSubtitle}>{unit.description}</div>
              </div>
            </div>

            <div className={styles.lessonNodes}>
              {unit.lessons.map((lesson, lessonIdx) => {
                const key = `${unitIdx}-${lessonIdx}`;
                const isUnlocked = !!unlockedLessons[key];
                const isDone = unlockedLessons[key] === 'done';
                const isActive = isUnlocked && !isDone;
                const firstExType = lesson.exercises?.[0]?.type || 'mcq';

                return (
                  <button
                    key={lessonIdx}
                    onClick={() => isUnlocked && onStartLesson(unitIdx, lessonIdx)}
                    disabled={!isUnlocked}
                    className={`${styles.lessonNode} ${
                      isDone ? styles.done : isActive ? styles.active : styles.locked
                    }`}
                    title={lesson.title}
                  >
                    <div className={styles.nodeCircle}>
                      <i
                        className={`ti ${
                          isDone
                            ? 'ti-check'
                            : isActive
                            ? TYPE_ICONS[firstExType]
                            : 'ti-lock'
                        }`}
                      ></i>
                    </div>
                    <div className={styles.nodeLabel}>{lesson.title}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <p>Complete lessons to earn XP and unlock new content! 🚀</p>
      </div>
    </div>
  );
}
