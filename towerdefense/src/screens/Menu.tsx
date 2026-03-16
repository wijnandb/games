import { useState, useEffect } from 'react';

interface MenuProps {
  currentLevel: number;
  unlockedCount: number;
  onStart: () => void;
  onGallery: () => void;
}

export default function Menu({ currentLevel, unlockedCount, onStart, onGallery }: MenuProps) {
  const [scanY, setScanY] = useState(0);

  useEffect(() => {
    let frame: number;
    const animate = () => {
      setScanY(prev => (prev + 0.3) % 100);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="menu-screen">
      <div className="scanline" style={{ top: `${scanY}%` }} />
      <div className="menu-grid-bg" />

      <div className="menu-content">
        <h1 className="menu-title glitch" data-text="NEON GRID">NEON GRID</h1>
        <h2 className="menu-subtitle">TOWER DEFENSE</h2>

        <div className="menu-buttons">
          <button className="menu-btn menu-btn-primary" onClick={onStart}>
            {currentLevel > 1 ? `CONTINUE (LEVEL ${currentLevel})` : 'START'}
          </button>
          <button className="menu-btn menu-btn-secondary" onClick={onGallery}>
            GALLERY ({unlockedCount}/50)
          </button>
        </div>

        <div className="menu-branding">BOLLENSTREEK DIGITAAL</div>
      </div>
    </div>
  );
}
