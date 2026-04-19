// Standalone read-only view for a publicly shared collection (no login).

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

interface Flashcard {
  flashcardID: number;
  question: string;
  answer: string;
}

export default function PublicSharedCollection() {
  const { collectionId } = useParams();
  const [title, setTitle] = useState('');
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (!collectionId) {
      setLoading(false);
      setError('Collection not found or not publicly shared.');
      return;
    }

    setLoading(true);
    setError('');
    Promise.all([
      fetch(`${API_BASE}/api/v1/public/collections/${collectionId}`),
      fetch(`${API_BASE}/api/v1/public/collections/${collectionId}/flashcards`),
    ])
      .then(async ([metaRes, cardsRes]) => {
        if (!metaRes.ok || !cardsRes.ok) {
          setError('Collection not found or not publicly shared.');
          setCards([]);
          setTitle('');
          return;
        }
        const meta = await metaRes.json();
        const list = await cardsRes.json();
        setTitle(meta.collectionName || 'Shared collection');
        setCards(Array.isArray(list) ? list : []);
        setError('');
      })
      .catch(() => {
        setError('Collection not found or not publicly shared.');
        setCards([]);
        setTitle('');
      })
      .finally(() => setLoading(false));
  }, [collectionId]);

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
  }, [collectionId, cards.length]);

  if (loading) {
    return (
      <div style={styles.page}>
        <p style={styles.muted}>Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <p style={styles.error}>{error}</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div style={styles.page}>
        <header style={styles.header}>
          <h1 style={styles.title}>{title || 'Shared collection'}</h1>
        </header>
        <p style={styles.muted}>No flashcards in this collection.</p>
      </div>
    );
  }

  const total = cards.length;
  const card = cards[index];

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>{title}</h1>
      </header>

      <main style={styles.mainCol}>
        <p style={styles.hint}>Click the card to flip</p>

        <div style={styles.row}>
        <button
          type="button"
          style={{ ...styles.arrow, ...(index === 0 ? styles.arrowDisabled : {}) }}
          onClick={() => {
            if (index > 0) {
              setIndex(index - 1);
              setFlipped(false);
            }
          }}
          disabled={index === 0}
          aria-label="Previous card"
        >
          ←
        </button>

        <div
          role="button"
          tabIndex={0}
          style={styles.card}
          onClick={() => setFlipped(!flipped)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setFlipped(!flipped);
            }
          }}
        >
          <p style={styles.cardLabel}>{flipped ? 'Answer' : 'Question'}</p>
          <p style={styles.cardText}>{flipped ? card.answer : card.question}</p>
        </div>

        <button
          type="button"
          style={{ ...styles.arrow, ...(index >= total - 1 ? styles.arrowDisabled : {}) }}
          onClick={() => {
            if (index < total - 1) {
              setIndex(index + 1);
              setFlipped(false);
            }
          }}
          disabled={index >= total - 1}
          aria-label="Next card"
        >
          →
        </button>
        </div>
      </main>

      <footer style={styles.footer}>
        {index + 1} / {total}
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f5f3ee',
    fontFamily: 'Georgia, serif',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '24px 16px 48px',
    boxSizing: 'border-box',
  },
  header: {
    marginBottom: '24px',
    textAlign: 'center',
    maxWidth: '640px',
  },
  title: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    margin: 0,
  },
  mainCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '720px',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    flexWrap: 'wrap',
    width: '100%',
  },
  hint: {
    width: '100%',
    textAlign: 'center',
    fontSize: '13px',
    color: '#888',
    fontFamily: 'sans-serif',
    margin: '0 0 12px 0',
  },
  arrow: {
    flexShrink: 0,
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    backgroundColor: '#ffffff',
    fontSize: '22px',
    cursor: 'pointer',
    color: '#333',
    fontFamily: 'sans-serif',
  },
  arrowDisabled: {
    opacity: 0.35,
    cursor: 'not-allowed',
  },
  card: {
    flex: '1 1 280px',
    maxWidth: '480px',
    minHeight: '220px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '40px 28px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    border: '1px solid #e0ddd6',
    textAlign: 'center',
    cursor: 'pointer',
    outline: 'none',
  },
  cardLabel: {
    fontSize: '11px',
    letterSpacing: '1px',
    color: '#aaa',
    fontFamily: 'sans-serif',
    marginBottom: '16px',
    textTransform: 'uppercase',
  },
  cardText: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    margin: 0,
    lineHeight: 1.5,
  },
  footer: {
    marginTop: '28px',
    fontSize: '14px',
    color: '#888',
    fontFamily: 'sans-serif',
  },
  muted: {
    color: '#888',
    paddingTop: '48px',
    fontFamily: 'sans-serif',
  },
  error: {
    color: '#555',
    paddingTop: '48px',
    fontFamily: 'sans-serif',
    textAlign: 'center',
    maxWidth: '400px',
    lineHeight: 1.6,
  },
};