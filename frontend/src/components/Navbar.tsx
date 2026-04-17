import { type CSSProperties, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import DarkModeToggle from './DarkModeToggle';

type Props = {
  /** Extra controls shown after Appearance / Profile (e.g. Exit Study). */
  appendRight?: ReactNode;
};

export default function Navbar({ appendRight }: Props) {
  const navigate = useNavigate();

  return (
    <nav style={styles.navbar}>
      <button
        type="button"
        style={styles.brandBtn}
        onClick={() => navigate('/collections')}
        aria-label="MindDeck home"
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <rect
            x="9"
            y="6"
            width="20"
            height="15"
            rx="3"
            fill="#a8c5a0"
            stroke="#6b8f71"
            strokeWidth="1.5"
          />
          <rect
            x="5"
            y="13"
            width="20"
            height="15"
            rx="3"
            fill="var(--app-card-secondary, white)"
            stroke="#6b8f71"
            strokeWidth="1.5"
          />
        </svg>
        <span style={styles.navTitle}>MindDeck</span>
      </button>
      <div style={styles.navRight}>
        <DarkModeToggle variant="compact" showLabel={false} />
        <button
          type="button"
          style={styles.navBtn}
          onClick={() => navigate('/settings/appearance')}
        >
          Appearance
        </button>
        <button
          type="button"
          style={styles.navBtn}
          onClick={() => navigate('/edit-profile')}
        >
          Profile
        </button>
        {appendRight}
      </div>
    </nav>
  );
}

const styles: Record<string, CSSProperties> = {
  navbar: {
    backgroundColor: 'var(--app-nav-bg, #ffffff)',
    padding: '12px 24px',
    borderBottom: '1px solid var(--app-nav-border, #e0ddd6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily: 'system-ui, sans-serif',
  },
  brandBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
  },
  navTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: 'var(--app-nav-text, #2c2c2c)',
    letterSpacing: '0.5px',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  navBtn: {
    background: 'none',
    border: '1px solid var(--app-border, #ddd)',
    borderRadius: 8,
    padding: '6px 14px',
    fontSize: 14,
    color: 'var(--app-muted-strong, #555)',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
};
