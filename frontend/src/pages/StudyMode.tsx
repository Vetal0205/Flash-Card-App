// Study Mode Page - UC4 (Qays), UC9 (Halema)
// Shows flashcards in randomized order for active study session
// UC4: User flips cards, marks thumbs up/down (correct/incorrect) - Qays
// UC9: Pause/resume study session without losing progress - Halema (component overlay)

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function StudyMode() {
  const navigate = useNavigate();
  const { collectionId } = useParams();

  return (
    <div style={styles.page}>
      <Navbar
        appendRight={
          <button
            type="button"
            style={styles.exitBtn}
            onClick={() => navigate(`/collections/${collectionId}`)}
          >
            Exit Study
          </button>
        }
      />

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
  page: { minHeight: '100vh', backgroundColor: 'var(--app-bg, #f5f3ee)', fontFamily: 'Georgia, serif' },
  exitBtn: { background: 'none', border: '1px solid var(--app-border, #ddd)', borderRadius: '8px', padding: '6px 16px', fontSize: '14px', color: 'var(--app-muted-strong, #555)', cursor: 'pointer', fontFamily: 'sans-serif' },
  container: { maxWidth: '600px', margin: '0 auto', padding: '32px 16px' },
  backBtn: { background: 'none', border: 'none', color: 'var(--app-muted-strong, #555)', fontSize: '14px', cursor: 'pointer', marginBottom: '16px', padding: '0' },
  heading: { fontSize: '22px', fontWeight: 'bold', color: 'var(--app-fg, #1a1a1a)', marginBottom: '16px' },
  placeholder: { color: 'var(--app-muted, #aaa)', fontFamily: 'sans-serif', fontSize: '14px' },
};