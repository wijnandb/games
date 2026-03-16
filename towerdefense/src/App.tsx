import { useState, useEffect, useCallback } from 'react';
import type { Screen } from './types';
import Menu from './screens/Menu';
import GameView from './screens/GameView';
import Reward from './screens/Reward';
import Gallery from './screens/Gallery';

const STORAGE_KEY = 'neon-grid-progress';

interface Progress {
  currentLevel: number;
  unlockedIds: number[];
}

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return {
        currentLevel: data.currentLevel || 1,
        unlockedIds: data.unlockedIds || [],
      };
    }
  } catch {}
  return { currentLevel: 1, unlockedIds: [] };
}

function saveProgress(progress: Progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [progress, setProgress] = useState<Progress>(loadProgress);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const handleStart = useCallback(() => {
    setScreen('game');
  }, []);

  const handleLevelComplete = useCallback(() => {
    setProgress(prev => {
      const newUnlocked = prev.unlockedIds.includes(prev.currentLevel)
        ? prev.unlockedIds
        : [...prev.unlockedIds, prev.currentLevel];
      return { ...prev, unlockedIds: newUnlocked };
    });
    setScreen('reward');
  }, []);

  const handleGameOver = useCallback(() => {
    setScreen('game');
  }, []);

  const handleNextWave = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      currentLevel: Math.min(prev.currentLevel + 1, 50),
    }));
    setScreen('game');
  }, []);

  const handleGallery = useCallback(() => {
    setScreen('gallery');
  }, []);

  const handleBackToMenu = useCallback(() => {
    setScreen('menu');
  }, []);

  switch (screen) {
    case 'menu':
      return (
        <Menu
          currentLevel={progress.currentLevel}
          unlockedCount={progress.unlockedIds.length}
          onStart={handleStart}
          onGallery={handleGallery}
        />
      );
    case 'game':
      return (
        <GameView
          level={progress.currentLevel}
          onLevelComplete={handleLevelComplete}
          onGameOver={handleGameOver}
        />
      );
    case 'reward':
      return (
        <Reward
          level={progress.currentLevel}
          unlockedCount={progress.unlockedIds.length}
          onNext={handleNextWave}
        />
      );
    case 'gallery':
      return (
        <Gallery
          unlockedIds={progress.unlockedIds}
          onBack={handleBackToMenu}
        />
      );
  }
}
