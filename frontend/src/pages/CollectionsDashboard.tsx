// Collections Dashboard - UC3 (Qays), UC5 (Qays), UC8 (Halema)
// Home page after login - shows all user's flashcard collections
// UC3: Create new collection
// UC5: Delete a collection (with confirmation)
// UC8: Rename a collection (Halema) - modal component
// Also includes: search bar (UC13), dark mode toggle button in navbar

import React from 'react';
import Navbar from '../components/Navbar';

export default function CollectionsDashboard() {
  return (
    <div style={styles.page}>
      <Navbar />
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
  page: { minHeight: '100vh', backgroundColor: 'var(--app-bg, #f5f3ee)', fontFamily: 'Georgia, serif' },
  container: { maxWidth: '900px', margin: '0 auto', padding: '32px 16px' },
  heading: { fontSize: '22px', fontWeight: 'bold', color: 'var(--app-fg, #1a1a1a)', marginBottom: '16px' },
  placeholder: { color: 'var(--app-muted, #aaa)', fontFamily: 'sans-serif', fontSize: '14px' },
};