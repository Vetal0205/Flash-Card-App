import { useState } from 'react';
import { Link } from 'react-router-dom';
import RenameCollection from '../components/RenameCollection';
import PauseSession from '../components/PauseSession';

function MockPage() {
  const [showRename, setShowRename] = useState(false);
  const [showPause, setShowPause] = useState(false);

  return (
    <div style={styles.container} data-testid="landing-page">
      <div style={styles.navLinks}>
        <Link style={styles.link} to="/settings/appearance">
          Appearance settings
        </Link>
        <Link style={styles.link} to="/collections">
          Collections
        </Link>
      </div>
      <button style={styles.button} onClick={() => setShowRename(true)}>
        Rename Collection
      </button>
      <button style={styles.button} onClick={() => setShowPause(true)}>
        Pause Session
      </button>

      {showRename && (
        <RenameCollection
          currentName="Biology 101"
          onSave={(name: string) => {
            console.log('Saved:', name);
            setShowRename(false);
          }}
          onCancel={() => setShowRename(false)}
        />
      )}

      {showPause && (
        <PauseSession
          deckName="Biology 101"
          currentCard={1}
          totalCards={4}
          onResume={() => setShowPause(false)}
          onDashboard={() => setShowPause(false)}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '20px',
    backgroundColor: 'var(--app-bg, #f5f0eb)',
  },
  navLinks: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
  },
  link: {
    color: 'var(--app-accent, #6b8f71)',
    fontSize: 14,
    fontFamily: 'sans-serif',
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#6b8f71',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '14px',
    cursor: 'pointer',
  },
};

export default MockPage;