import { type CSSProperties } from 'react';
import { useTheme } from './ThemeContext';

type Props = {
  variant?: 'default' | 'compact';
  showLabel?: boolean;
};

export default function DarkModeToggle({
  variant = 'default',
  showLabel = true,
}: Props) {
  const { dark, toggle } = useTheme();
  const compact = variant === 'compact';
  const accent = 'var(--app-accent, #6b8f71)';

  return (
    <div style={compact ? styles.rowCompact : styles.row} className="dark-mode-toggle">
      {showLabel ? (
        <div>
          <p style={{ ...styles.label, fontSize: compact ? 13 : 16 }}>Dark mode</p>
          {!compact ? <p style={styles.hint}>{dark ? 'Dark theme is on' : 'Dark theme is off'}</p> : null}
        </div>
      ) : null}
      <button
        type="button"
        role="switch"
        aria-checked={dark}
        aria-label="Toggle dark mode"
        onClick={toggle}
        style={{
          ...styles.switchTrack,
          width: compact ? 44 : 50,
          height: compact ? 26 : 28,
          backgroundColor: dark ? accent : '#c4c4c4',
        }}
      >
        <span
          style={{
            ...styles.switchThumb,
            width: compact ? 20 : 22,
            height: compact ? 20 : 22,
            transform: dark ? `translateX(${compact ? 18 : 22}px)` : 'translateX(0)',
          }}
        />
      </button>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  rowCompact: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontWeight: 600,
    margin: 0,
    color: 'var(--app-fg, #333)',
  },
  hint: {
    fontSize: 13,
    margin: '4px 0 0 0',
    color: 'var(--app-muted, #888)',
  },
  switchTrack: {
    borderRadius: 14,
    border: 'none',
    padding: 3,
    cursor: 'pointer',
    position: 'relative',
    flexShrink: 0,
    transition: 'background-color 0.2s ease',
  },
  switchThumb: {
    display: 'block',
    borderRadius: '50%',
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
    transition: 'transform 0.2s ease',
  },
};
