import { type CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PreviewCard from '../components/PreviewCard';

const SAMPLE = [
  { question: 'What is photosynthesis?', answer: 'Process plants use to make food from light.' },
  { question: 'Define mitochondria', answer: 'Organelle that produces ATP.' },
];

export default function ExportCollectionPage() {
  const navigate = useNavigate();
  const { collectionId } = useParams();

  function handleExportPdf() {
    // TODO: wire to PDF export API (UC11)
    window.alert('Export to PDF will call the API when UC11 is implemented.');
  }

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <button
          type="button"
          style={styles.backBtn}
          onClick={() =>
            collectionId
              ? navigate(`/collections/${collectionId}`)
              : navigate('/collections')
          }
        >
          ← Back to collection
        </button>
        <h1 style={styles.h1}>Export collection</h1>
        <p style={styles.lead}>
          Collection ID: <code style={styles.code}>{collectionId ?? '—'}</code>
          — preview what will be included in the PDF export.
        </p>
        <button type="button" style={styles.primary} onClick={handleExportPdf}>
          Download PDF
        </button>
        <div style={styles.list}>
          <h2 style={styles.h2}>Included cards</h2>
          {SAMPLE.map((row, i) => (
            <PreviewCard
              key={row.question}
              index={i}
              question={row.question}
              answer={row.answer}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: 'var(--app-bg, #f5f3ee)',
    fontFamily: 'Georgia, serif',
  },
  container: {
    maxWidth: 720,
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
  h1: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'var(--app-fg, #1a1a1a)',
    marginTop: 0,
  },
  lead: {
    fontSize: 14,
    color: 'var(--app-muted, #666)',
    lineHeight: 1.5,
    marginBottom: 20,
    fontFamily: 'sans-serif',
  },
  code: {
    fontSize: 13,
    backgroundColor: 'var(--app-surface, #eee)',
    padding: '2px 6px',
    borderRadius: 4,
  },
  primary: {
    backgroundColor: 'var(--app-accent, #6b8f71)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '10px 20px',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'sans-serif',
  },
  list: {
    marginTop: 28,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  h2: {
    fontSize: 18,
    fontFamily: 'sans-serif',
    color: 'var(--app-fg, #1a1a1a)',
    margin: '0 0 8px 0',
  },
};
