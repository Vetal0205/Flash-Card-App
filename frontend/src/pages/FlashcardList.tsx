// Flashcard List Page - UC4 (Qays), UC10 (Aaliyan), UC11 (Aaliyan), UC13 (Vitalii), UC14 (Vitalii), UC16 (Vitalii)
// Shows all flashcards inside a specific collection
// UC4:  "Study" button to start random study mode
// UC10: Import flashcards from file (Aaliyan) - modal/button
// UC11: Export collection as PDF (Aaliyan) - modal/button
// UC13: Search bar to filter flashcards by keyword (Vitalii)
// UC14: Add flashcard manually via "+" button (Vitalii)
// UC16: Share collection button (Vitalii)

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function FlashcardList() {
  const navigate = useNavigate();
  const { collectionId } = useParams();

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <button style={styles.backBtn} onClick={() => navigate('/collections')}>
          ← Back to Collections
        </button>

        {/* TODO: Collection title - fetch by collectionId */}
        <h2 style={styles.heading}>Collection Name</h2>

        <div style={styles.actions}>
          <button
            type="button"
            style={styles.actionBtn}
            onClick={() => navigate(`/collections/${collectionId}/study`)}
          >
            Study
          </button>
          <button
            type="button"
            style={styles.actionBtn}
            onClick={() => navigate('/difficult-flashcards')}
          >
            Study Difficult
          </button>
          <button
            type="button"
            style={styles.actionBtn}
            onClick={() =>
              navigate(`/collections/${collectionId}/import-flashcards`)
            }
          >
            Import
          </button>
          <button
            type="button"
            style={styles.actionBtn}
            onClick={() =>
              navigate(`/collections/${collectionId}/export-collection`)
            }
          >
            Export PDF
          </button>
        </div>

        {/* TODO: Search bar to filter flashcards - UC13 (Vitalii) */}
        {/* TODO: "Share" → UC16 (Vitalii) */}
        {/* TODO: "+" → add flashcard manually - UC14 (Vitalii) */}

        {/* TODO: Table/list of flashcards */}
        {/* Each row: question, answer, isFlaggedDifficult checkbox, edit/delete */}

        <p style={styles.placeholder}>UC4, UC10, UC11, UC13, UC14, UC16 - Flashcard list goes here</p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: 'var(--app-bg, #f5f3ee)', fontFamily: 'Georgia, serif' },
  container: { maxWidth: '900px', margin: '0 auto', padding: '32px 16px' },
  backBtn: { background: 'none', border: 'none', color: 'var(--app-muted-strong, #555)', fontSize: '14px', cursor: 'pointer', marginBottom: '16px', padding: '0' },
  heading: { fontSize: '22px', fontWeight: 'bold', color: 'var(--app-fg, #1a1a1a)', marginBottom: '16px' },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  actionBtn: {
    background: 'var(--app-card, #fff)',
    border: '1px solid var(--app-border, #ddd)',
    borderRadius: 8,
    padding: '8px 14px',
    fontSize: 14,
    color: 'var(--app-muted-strong, #555)',
    cursor: 'pointer',
    fontFamily: 'sans-serif',
  },
  placeholder: { color: 'var(--app-muted, #aaa)', fontFamily: 'sans-serif', fontSize: '14px' },
};