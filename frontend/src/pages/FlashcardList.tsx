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

export default function FlashcardList() {
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
          {/* TODO: Dark mode toggle button - UC12 (Aaliyan) */}
          <button style={styles.profileBtn} onClick={() => navigate('/edit-profile')}>Profile</button>
        </div>
      </nav>
      <div style={styles.container}>
        <button style={styles.backBtn} onClick={() => navigate('/collections')}>
          ← Back to Collections
        </button>

        {/* TODO: Collection title - fetch by collectionId */}
        <h2 style={styles.heading}>Collection Name</h2>

        {/* TODO: Search bar to filter flashcards - UC13 (Vitalii) */}

        {/* TODO: Action buttons */}
        {/* "Study" → navigate(`/collections/${collectionId}/study`) - UC4 (Qays) */}
        {/* "Study Difficult" → navigate('/difficult-flashcards') - UC7 (Srinidhi) */}
        {/* "Import" → open import modal - UC10 (Aaliyan) */}
        {/* "Export PDF" → open export modal - UC11 (Aaliyan) */}
        {/* "Share" → UC16 (Vitalii) */}
        {/* "+" → add flashcard manually - UC14 (Vitalii) */}

        {/* TODO: Table/list of flashcards */}
        {/* Each row: question, answer, isFlaggedDifficult checkbox, edit/delete */}

        <p style={styles.placeholder}>UC4, UC10, UC11, UC13, UC14, UC16 - Flashcard list goes here</p>
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
  profileBtn: { background: 'none', border: '1px solid #ddd', borderRadius: '8px', padding: '6px 16px', fontSize: '14px', color: '#555', cursor: 'pointer', fontFamily: 'sans-serif' },
  container: { maxWidth: '900px', margin: '0 auto', padding: '32px 16px' },
  backBtn: { background: 'none', border: 'none', color: '#555', fontSize: '14px', cursor: 'pointer', marginBottom: '16px', padding: '0' },
  heading: { fontSize: '22px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '16px' },
  placeholder: { color: '#aaa', fontFamily: 'sans-serif', fontSize: '14px' },
};