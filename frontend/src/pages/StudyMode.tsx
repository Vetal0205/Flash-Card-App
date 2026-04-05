// Study Mode Page - UC4 (Qays), UC9 (Halema)
// Shows flashcards in randomized order for active study session
// UC4: User flips cards, marks thumbs up/down (correct/incorrect) - Qays
// UC9: Pause/resume study session without losing progress - Halema (component overlay)

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function StudyMode() {
  const navigate = useNavigate();
  const { collectionId } = useParams();

  return (
    <div style={styles.page}>
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="9" y="6" width="20" height="15" rx="3" fill="#a8c5a0" stroke="#6b8f71" strokeWidth="1.5"/>
            <rect x="5" y="13" width="20" height="15" rx="3" fill="white" stroke="#6b8f71" strokeWidth="1.5"/>
          </svg>
          <span style={styles.navTitle}>MindDeck</span>
        </div>
        <div style={styles.navRight}>
          {/* TODO: Dark mode toggle - UC12 (Aaliyan) */}
          {/* TODO: Pause button - UC9 (Halema) */}
          <button style={styles.exitBtn} onClick={() => navigate(`/collections/${collectionId}`)}>Exit Study</button>
        </div>
      </nav>

      <div style={styles.container}>
        <button style={styles.backBtn} onClick={() => navigate(`/collections/${collectionId}`)}>
          ← Back to Collection
        </button>

        {/* TODO: Progress bar - UC4 (Qays) */}
        {/* TODO: Flashcard flip component - UC4 (Qays) */}
        {/* TODO: Thumbs up / Thumbs down - UC4 (Qays) */}
        {/* TODO: Pause overlay - UC9 (Halema) */}
        {/* TODO: Session summary modal on completion - UC4 (Qays) */}

        <h2 style={styles.heading}>Study Mode</h2>
        <p style={styles.placeholder}>UC4, UC9 - Study mode goes here</p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: '#f5f3ee', fontFamily: 'Georgia, serif' },
  navbar: { backgroundColor: '#ffffff', padding: '12px 24px', borderBottom: '1px solid #e0ddd6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  navBrand: { display: 'flex', alignItems: 'center', gap: '8px' },
  navTitle: { fontWeight: 'bold', fontSize: '18px', color: '#2c2c2c', letterSpacing: '0.5px' },
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  exitBtn: { background: 'none', border: '1px solid #ddd', borderRadius: '8px', padding: '6px 16px', fontSize: '14px', color: '#555', cursor: 'pointer', fontFamily: 'sans-serif' },
  container: { maxWidth: '600px', margin: '0 auto', padding: '32px 16px' },
  backBtn: { background: 'none', border: 'none', color: '#555', fontSize: '14px', cursor: 'pointer', marginBottom: '16px', padding: '0' },
  heading: { fontSize: '22px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '16px' },
  placeholder: { color: '#aaa', fontFamily: 'sans-serif', fontSize: '14px' },
};