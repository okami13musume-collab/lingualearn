'use client';

import { useRef } from 'react';
import styles from './UploadScreen.module.css';

interface UploadScreenProps {
  selectedFile: File | null;
  pastedText: string;
  nativeLang: string;
  targetLang: string;
  difficulty: string;
  selectedExercises: Record<string, boolean>;
  error: string;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  onTextChange: (text: string) => void;
  onNativeLangChange: (lang: string) => void;
  onTargetLangChange: (lang: string) => void;
  onDifficultyChange: (level: string) => void;
  onExerciseToggle: (type: string) => void;
  onGenerate: () => void;
  isLoading?: boolean;
}

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Japanese', 'Mandarin', 
  'Portuguese', 'Italian', 'Korean', 'Arabic', 'Russian'
];

const EXERCISE_TYPES = [
  { id: 'mcq', label: 'Multiple choice', icon: 'ti-list-check' },
  { id: 'fill', label: 'Fill in blank', icon: 'ti-text-size' },
  { id: 'flash', label: 'Flashcards', icon: 'ti-cards' },
  { id: 'match', label: 'Matching', icon: 'ti-arrows-join' },
  { id: 'tf', label: 'True / False', icon: 'ti-toggle-left' },
  { id: 'speak', label: 'Speaking', icon: 'ti-microphone' },
  { id: 'listen', label: 'Listening', icon: 'ti-headphones' },
  { id: 'role', label: 'Role play', icon: 'ti-messages' },
  { id: 'write', label: 'Writing', icon: 'ti-pencil' },
];

export default function UploadScreen({
  selectedFile,
  pastedText,
  nativeLang,
  targetLang,
  difficulty,
  selectedExercises,
  error,
  onFileSelect,
  onFileRemove,
  onTextChange,
  onNativeLangChange,
  onTargetLangChange,
  onDifficultyChange,
  onExerciseToggle,
  onGenerate,
  isLoading = false,
}: UploadScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadZoneRef = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    uploadZoneRef.current?.classList.add(styles.drag);
  };

  const handleDragLeave = () => {
    uploadZoneRef.current?.classList.remove(styles.drag);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    uploadZoneRef.current?.classList.remove(styles.drag);
    if (e.dataTransfer?.files?.[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <i className="ti ti-language"></i>
          </div>
          <span className={styles.logoText}>LinguaLearn</span>
        </div>
        <h1>Turn your materials into interactive lessons</h1>
        <p>Upload any document, image, or paste text — we'll create a personalised Duolingo-style course from it.</p>
      </div>

      <div
        ref={uploadZoneRef}
        className={styles.uploadZone}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <i className="ti ti-cloud-upload"></i>
        <h3>Drop your file here</h3>
        <p>or click to browse</p>
        <div className={styles.fileTypes}>
          <span className={styles.fileBadge}>PDF</span>
          <span className={styles.fileBadge}>TXT</span>
          <span className={styles.fileBadge}>PNG / JPG</span>
          <span className={styles.fileBadge}>DOCX</span>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
        accept=".pdf,.txt,.png,.jpg,.jpeg,.docx"
        style={{ display: 'none' }}
      />

      {selectedFile && (
        <div className={styles.uploadedFile}>
          <div className={styles.fileIcon}>
            <i className="ti ti-file"></i>
          </div>
          <div className={styles.fileInfo}>
            <div className={styles.fileName}>{selectedFile.name}</div>
            <div className={styles.fileSize}>
              {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
            </div>
          </div>
          <i
            className="ti ti-x"
            onClick={onFileRemove}
            style={{ cursor: 'pointer', color: 'var(--color-text-secondary)' }}
          ></i>
        </div>
      )}

      <div className={styles.divider}>or paste your text</div>

      <textarea
        value={pastedText}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Paste vocabulary lists, grammar notes, reading passages, or any language learning content here…"
        className={styles.textarea}
      />

      <div className={styles.langRow}>
        <div>
          <label className={styles.sectionLabel}>I speak</label>
          <select
            value={nativeLang}
            onChange={(e) => onNativeLangChange(e.target.value)}
            className={styles.select}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
        <button
          className={styles.swapBtn}
          onClick={() => {
            const temp = nativeLang;
            onNativeLangChange(targetLang);
            onTargetLangChange(temp);
          }}
        >
          <i className="ti ti-arrows-left-right"></i>
        </button>
        <div>
          <label className={styles.sectionLabel}>I'm learning</label>
          <select
            value={targetLang}
            onChange={(e) => onTargetLangChange(e.target.value)}
            className={styles.select}
          >
            {LANGUAGES.filter((l) => l !== nativeLang).map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className={styles.sectionLabel}>Exercise types to include</label>
      <div className={styles.exerciseGrid}>
        {EXERCISE_TYPES.map((ex) => (
          <div
            key={ex.id}
            className={`${styles.exChip} ${
              selectedExercises[ex.id] ? styles.selected : ''
            }`}
            onClick={() => onExerciseToggle(ex.id)}
          >
            <i className={`ti ${ex.icon}`}></i>
            {ex.label}
          </div>
        ))}
      </div>

      <label className={styles.sectionLabel}>Difficulty level</label>
      <select
        value={difficulty}
        onChange={(e) => onDifficultyChange(e.target.value)}
        className={styles.select}
      >
        <option value="beginner">Beginner — slow pace, lots of hints</option>
        <option value="intermediate">Intermediate — balanced challenge</option>
        <option value="advanced">Advanced — minimal hints, complex tasks</option>
      </select>

      {error && <div className={styles.errorMsg}>{error}</div>}

      <button
        onClick={onGenerate}
        disabled={isLoading}
        className={styles.btnPrimary}
      >
        Generate my lessons
        <i className="ti ti-arrow-right"></i>
      </button>
    </div>
  );
}
