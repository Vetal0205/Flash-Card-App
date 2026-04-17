import { type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DarkModeToggle from '../components/DarkModeToggle';

export default function AppearanceSettingsPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.main}>
        <button
          type="button"
          style={styles.backBtn}
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <div style={styles.card}>
          <h1 style={styles.title}>Appearance</h1>
          <p style={styles.subtitle}>
            Choose light or dark theme. Your choice is saved on this device.
          </p>
          <DarkModeToggle variant="default" showLabel />
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: 'var(--app-bg, #f5f3ee)',
    fontFamily: 'Georgia, serif',
  },
  main: {
    maxWidth: 480,
    margin: '0 auto',
    padding: '32px 16px',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--app-muted-strong, #555)',
    fontSize: 14,
    cursor: 'pointer',
    marginBottom: 20,
    padding: 0,
    fontFamily: 'sans-serif',
  },
  card: {
    backgroundColor: 'var(--app-card, #ffffff)',
    border: '1px solid var(--app-border, #e0ddd6)',
    borderRadius: 12,
    padding: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    margin: '0 0 8px 0',
    color: 'var(--app-fg, #1a1a1a)',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 1.5,
    margin: '0 0 24px 0',
    color: 'var(--app-muted, #888)',
  },
};
