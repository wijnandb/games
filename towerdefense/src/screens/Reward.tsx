import { useState, useEffect } from 'react';
import { PHOTOS } from '../config';

interface RewardProps {
  level: number;
  unlockedCount: number;
  onNext: () => void;
}

export default function Reward({ level, unlockedCount, onNext }: RewardProps) {
  const [phase, setPhase] = useState(0);
  const photo = PHOTOS[level - 1];

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 900);
    const t3 = setTimeout(() => setPhase(3), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="reward-screen">
      <div className={`reward-title ${phase >= 0 ? 'visible' : ''}`}>
        LEVEL {level} COMPLETE
      </div>

      <div className={`reward-frame ${phase >= 1 ? 'visible' : ''}`}>
        {photo && (
          <img
            src={photo.url}
            alt={photo.caption}
            className={`reward-photo ${phase >= 2 ? 'visible' : ''}`}
          />
        )}
        <div className="reward-shimmer" />
      </div>

      {photo && (
        <div className={`reward-caption ${phase >= 2 ? 'visible' : ''}`}>
          {photo.caption}
        </div>
      )}

      <div className={`reward-counter ${phase >= 2 ? 'visible' : ''}`}>
        {unlockedCount} / 50 unlocked
      </div>

      <button
        className={`reward-next ${phase >= 3 ? 'visible' : ''}`}
        onClick={onNext}
      >
        NEXT WAVE &rarr;
      </button>
    </div>
  );
}
