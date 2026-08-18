'use client';

import { useState } from 'react';
import axios from 'axios';
import UploadScreen from '@/components/UploadScreen';
import LoadingScreen from '@/components/LoadingScreen';
import MapScreen from '@/components/MapScreen';
import ExerciseScreen from '@/components/ExerciseScreen';
import CompleteScreen from '@/components/CompleteScreen';

export default function Home() {
  const [screen, setScreen] = useState<'upload' | 'loading' | 'map' | 'exercise' | 'complete'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [nativeLang, setNativeLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Spanish');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [selectedExercises, setSelectedExercises] = useState({
    mcq: true,
    fill: true,
    flash: true,
    match: true,
    tf: true,
    speak: true,
    listen: true,
    role: true,
    write: true,
  });

  const [courseData, setCourseData] = useState<any>(null);
  const [currentUnit, setCurrentUnit] = useState(0);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [exercises, setExercises] = useState<any[]>([]);
  const [lives, setLives] = useState(3);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [totalXP, setTotalXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [unlockedLessons, setUnlockedLessons] = useState<Record<string, boolean | string>>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);

  const handleGenerate = async () => {
    const content = pastedText.trim() || selectedFile;
    if (!content) {
      setError('Please upload a file or paste some content to get started.');
      return;
    }

    const selectedTypes = Object.keys(selectedExercises).filter(
      (k) => selectedExercises[k as keyof typeof selectedExercises]
    );

    if (selectedTypes.length === 0) {
      setError('Please select at least one exercise type.');
      return;
    }

    setLoading(true);
    setLoadingProgress(0);
    setError('');
    setScreen('loading');

    try {
      const formData = new FormData();
      formData.append('content', pastedText);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      formData.append('nativeLang', nativeLang);
      formData.append('targetLang', targetLang);
      formData.append('difficulty', difficulty);
      formData.append('exerciseTypes', JSON.stringify(selectedTypes));

      const progressInterval = setInterval(() => {
        setLoadingProgress((p) => Math.min(p + Math.random() * 15, 85));
      }, 500);

      const response = await axios.post('/api/generate-course', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      clearInterval(progressInterval);
      setLoadingProgress(100);

      const data = response.data;
      setCourseData(data.courseData);

      const unlocked: Record<string, boolean | string> = {};
      unlocked['0-0'] = true;
      setUnlockedLessons(unlocked);

      setTotalXP(0);
      setStreak(0);

      setTimeout(() => {
        setScreen('map');
      }, 1500);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        err.message ||
        'Failed to generate course. Please try again.'
      );
      setScreen('upload');
    } finally {
      setLoading(false);
    }
  };

  const startLesson = (ui: number, li: number) => {
    const key = `${ui}-${li}`;
    if (!unlockedLessons[key]) return;

    setCurrentUnit(ui);
    setCurrentLesson(li);
    setCurrentExIdx(0);
    setCorrectCount(0);
    setLives(3);
    setStartTime(Date.now());
    setExercises(courseData.units[ui].lessons[li].exercises || []);
    setScreen('exercise');
  };

  const handleCheckAnswer = (isCorrect: boolean) => {
    const newCorrectCount = isCorrect ? correctCount + 1 : correctCount;
    const newLives = isCorrect ? lives : lives - 1;
    setCorrectCount(newCorrectCount);
    setLives(newLives);

    if (currentExIdx + 1 >= exercises.length || newLives <= 0) {
      endLesson(newCorrectCount);
    } else {
      setTimeout(() => setCurrentExIdx(currentExIdx + 1), 1000);
    }
  };

  const endLesson = (finalCorrectCount: number) => {
    const elapsed = Math.round((Date.now() - (startTime || Date.now())) / 1000);
    const acc = Math.round((finalCorrectCount / exercises.length) * 100);
    const xp = Math.round(acc * 0.5 + 10);

    setTotalXP(totalXP + xp);
    setStreak(streak + 1);

    const key = `${currentUnit}-${currentLesson}`;
    const newUnlocked = { ...unlockedLessons, [key]: 'done' };

    const nextLi = currentLesson + 1;
    const nextUi = currentUnit;
    if (nextLi < courseData.units[nextUi].lessons.length) {
      newUnlocked[`${nextUi}-${nextLi}`] = true;
    } else if (nextUi + 1 < courseData.units.length) {
      newUnlocked[`${nextUi + 1}-0`] = true;
    }

    setUnlockedLessons(newUnlocked);
    setScreen('complete');
  };

  return (
    <div>
      {screen === 'upload' && (
        <UploadScreen
          selectedFile={selectedFile}
          pastedText={pastedText}
          nativeLang={nativeLang}
          targetLang={targetLang}
          difficulty={difficulty}
          selectedExercises={selectedExercises}
          error={error}
          onFileSelect={setSelectedFile}
          onFileRemove={() => setSelectedFile(null)}
          onTextChange={setPastedText}
          onNativeLangChange={setNativeLang}
          onTargetLangChange={setTargetLang}
          onDifficultyChange={setDifficulty}
          onExerciseToggle={(ex) =>
            setSelectedExercises({
              ...selectedExercises,
              [ex]: !selectedExercises[ex as keyof typeof selectedExercises],
            })
          }
          onGenerate={handleGenerate}
          isLoading={loading}
        />
      )}

      {screen === 'loading' && <LoadingScreen progress={loadingProgress} />}

      {screen === 'map' && courseData && (
        <MapScreen
          courseData={courseData}
          totalXP={totalXP}
          streak={streak}
          unlockedLessons={unlockedLessons}
          onStartLesson={startLesson}
        />
      )}

      {screen === 'exercise' && courseData && (
        <ExerciseScreen
          exercises={exercises}
          currentExIdx={currentExIdx}
          lives={lives}
          onCheckAnswer={handleCheckAnswer}
          onClose={() => setScreen('map')}
        />
      )}

      {screen === 'complete' && (
        <CompleteScreen
          correctCount={correctCount}
          totalExercises={exercises.length}
          xpEarned={Math.round((correctCount / exercises.length) * 0.5 + 10)}
          timeSpent={Math.round((Date.now() - (startTime || Date.now())) / 1000)}
          onContinue={() => setScreen('map')}
        />
      )}
    </div>
  );
}
