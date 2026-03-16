import { useState } from 'react';
import { PHOTOS } from '../config';

interface GalleryProps {
  unlockedIds: number[];
  onBack: () => void;
}

export default function Gallery({ unlockedIds, onBack }: GalleryProps) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const unlockedSet = new Set(unlockedIds);

  return (
    <div className="gallery-screen">
      <div className="gallery-header">
        <button className="gallery-back" onClick={onBack}>&larr; BACK</button>
        <h1 className="gallery-title">COLLECTION</h1>
        <div className="gallery-counter">{unlockedIds.length} / 50 unlocked</div>
      </div>

      <div className="gallery-grid">
        {PHOTOS.map(photo => {
          const unlocked = unlockedSet.has(photo.id);
          return (
            <div
              key={photo.id}
              className={`gallery-card ${unlocked ? 'unlocked' : 'locked'}`}
              onClick={() => unlocked && setLightbox(photo.id)}
            >
              {unlocked ? (
                <img src={photo.url} alt={photo.caption} loading="lazy" />
              ) : (
                <div className="gallery-locked">
                  <span className="lock-icon">&#128274;</span>
                  <span className="lock-label">LVL {photo.id}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {lightbox !== null && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <img
              src={PHOTOS.find(p => p.id === lightbox)?.url}
              alt={PHOTOS.find(p => p.id === lightbox)?.caption}
            />
            <div className="lightbox-caption">
              {PHOTOS.find(p => p.id === lightbox)?.caption}
            </div>
            <button className="lightbox-close" onClick={() => setLightbox(null)}>
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
