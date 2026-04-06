// Collections Dashboard - UC3 (Qays), UC5 (Qays), UC8 (Halema)
// Home page after login - shows all user's flashcard collections
// UC3: Create new collection
// UC5: Delete a collection (with confirmation)
// UC8: Rename a collection (Halema) - modal component
// Also includes: search bar (UC13), dark mode toggle button in navbar

import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function CollectionsDashboard() {
  const navigate = useNavigate();
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
          {/* TODO: User avatar - click to go to edit profile */}
          <button style={styles.profileBtn} onClick={() => navigate('/edit-profile')}>Profile</button>
        </div>
      </nav>
      <div style={styles.container}>
        {/* TODO: Search bar to filter collections - UC13 (Vitalii) */}

        {/* TODO: "New Collection" button - UC3 (Qays) */}
        {/* On click: show form to enter collection name and details */}
        {/* On submit: save collection to database */}

        {/* TODO: List of user's collections - UC3, UC5 (Qays) */}
        {/* Each collection card: Open → navigate('/collections/:id') */}
        {/* Rename button → UC8 (Halema) */}
        {/* Delete button → confirm then delete - UC5 (Qays) */}

        <h2 style={styles.heading}>My Collections</h2>
        <p style={styles.placeholder}>UC3, UC5, UC8 - Collections list goes here</p>
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
  heading: { fontSize: '22px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '16px' },
  placeholder: { color: '#aaa', fontFamily: 'sans-serif', fontSize: '14px' },
};