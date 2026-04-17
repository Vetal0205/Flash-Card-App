import type { CSSProperties } from 'react';

type Props = {
  question: string;
  answer: string;
  index?: number;
};

export default function PreviewCard({ question, answer, index }: Props) {
  return (
    <div style={styles.card}>
      {index != null ? (
        <span style={styles.badge}>#{index + 1}</span>
      ) : null}
      <p style={styles.q}>{question}</p>
      <p style={styles.a}>{answer}</p>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  card: {
    position: 'relative',
    border: '1px solid var(--app-border, #e0ddd6)',
    borderRadius: 12,
    padding: '14px 16px',
    backgroundColor: 'var(--app-card, #ffffff)',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 12,
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--app-muted, #888)',
    fontFamily: 'sans-serif',
  },
  q: {
    margin: '0 0 8px 0',
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--app-fg, #1a1a1a)',
    fontFamily: 'sans-serif',
    paddingRight: 36,
  },
  a: {
    margin: 0,
    fontSize: 14,
    color: 'var(--app-muted-strong, #555)',
    fontFamily: 'Georgia, serif',
  },
};
