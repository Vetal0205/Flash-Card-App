// Srinidhi Sivakaminathan
// UC7 - Review Difficult Flashcards Page
// This page shows flashcards that the user previously marked as difficult
// User can flip cards to see the answer and navigate between them

import { useState } from "react";
import React from 'react';
import { useNavigate } from 'react-router-dom';

const dummyCards = [
  { flashcardID: 1, collectionID: 1, question: "What is the nucleus?", answer: "Controls cell activities", knownCount: 1, unknownCount: 3, isFlaggedDifficult: true },
  { flashcardID: 2, collectionID: 1, question: "Define osmosis", answer: "Movement of water across membranes", knownCount: 0, unknownCount: 4, isFlaggedDifficult: true },
  { flashcardID: 3, collectionID: 1, question: "What does ATP do?", answer: "Stores energy for cells", knownCount: 2, unknownCount: 2, isFlaggedDifficult: true },
  { flashcardID: 4, collectionID: 1, question: "What is mitosis?", answer: "Cell division producing identical cells", knownCount: 0, unknownCount: 5, isFlaggedDifficult: true },
];

const collectionName = "Spanish Vocabulary";

export default function DifficultFlashcards() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const totalCards = dummyCards.length;
  const currentCard = dummyCards[currentIndex];
  const progress = Math.round(((currentIndex + 1) / totalCards) * 100);

  const handleNext = () => {
    if (currentIndex < totalCards - 1) { setCurrentIndex(currentIndex + 1); setIsFlipped(false); }
  };
  const handlePrevious = () => {
    if (currentIndex > 0) { setCurrentIndex(currentIndex - 1); setIsFlipped(false); }
  };
  const handleFlip = () => setIsFlipped(!isFlipped);

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
        <button style={styles.exitBtn} onClick={() => navigate('/collections')}>Exit Study</button>
      </nav>

      <div style={styles.container}>
        <button style={styles.backBtn} onClick={() => navigate('/collections')}>← Back to Collection</button>
        <h2 style={styles.heading}>Study: Difficult Cards</h2>
        <p style={styles.subtitle}>{collectionName} · {totalCards} difficult cards</p>

        <div style={styles.progressRow}>
          <span style={styles.progressLabel}>Card {currentIndex + 1} of {totalCards}</span>
          <span style={styles.progressLabel}>{progress}%</span>
        </div>
        <div style={styles.progressBarBg}>
          <div style={{ ...styles.progressBarFill, width: `${progress}%` }} />
        </div>

        <p style={styles.flipHint}>Click card to reveal answer</p>

        <div style={styles.cardWrapper} onClick={handleFlip}>
          <div style={styles.difficultBadge}>Difficult</div>
          <div style={styles.cardSide}>
            <p style={styles.cardLabel}>{isFlipped ? "ANSWER" : "QUESTION"}</p>
            <p style={styles.cardText}>{isFlipped ? currentCard.answer : currentCard.question}</p>
            {!isFlipped && <p style={styles.clickToFlip}>Click to flip</p>}
          </div>
          <div style={styles.statsRow}>
            <span style={styles.knownStat}>✓ Known: {currentCard.knownCount}</span>
            <span style={styles.unknownStat}>✗ Unknown: {currentCard.unknownCount}</span>
          </div>
        </div>

        <div style={styles.navBtns}>
          <button style={{ ...styles.navBtn, opacity: currentIndex === 0 ? 0.4 : 1, cursor: currentIndex === 0 ? "not-allowed" : "pointer" }} onClick={handlePrevious} disabled={currentIndex === 0}>← Previous</button>
          <button style={{ ...styles.navBtn, opacity: currentIndex === totalCards - 1 ? 0.4 : 1, cursor: currentIndex === totalCards - 1 ? "not-allowed" : "pointer" }} onClick={handleNext} disabled={currentIndex === totalCards - 1}>Next →</button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", backgroundColor: "#f5f3ee", fontFamily: "Georgia, serif" },
  navbar: { backgroundColor: "#ffffff", padding: "12px 24px", borderBottom: "1px solid #e0ddd6", display: "flex", alignItems: "center", justifyContent: "space-between" },
  navBrand: { display: "flex", alignItems: "center", gap: "8px" },
  navTitle: { fontWeight: "bold", fontSize: "18px", color: "#2c2c2c", letterSpacing: "0.5px" },
  exitBtn: { background: "none", border: "1px solid #ddd", borderRadius: "8px", padding: "6px 16px", fontSize: "14px", color: "#555", cursor: "pointer", fontFamily: "sans-serif" },
  container: { maxWidth: "600px", margin: "0 auto", padding: "32px 16px" },
  backBtn: { background: "none", border: "none", color: "#555", fontSize: "14px", cursor: "pointer", marginBottom: "16px", padding: "0" },
  heading: { fontSize: "22px", fontWeight: "bold", color: "#1a1a1a", marginBottom: "4px", marginTop: "0" },
  subtitle: { fontSize: "14px", color: "#888", marginBottom: "24px", marginTop: "0", fontFamily: "sans-serif" },
  progressRow: { display: "flex", justifyContent: "space-between", marginBottom: "8px" },
  progressLabel: { fontSize: "13px", color: "#888", fontFamily: "sans-serif" },
  progressBarBg: { width: "100%", height: "6px", backgroundColor: "#e0ddd6", borderRadius: "999px", marginBottom: "16px" },
  progressBarFill: { height: "6px", backgroundColor: "#6b8f71", borderRadius: "999px", transition: "width 0.3s ease" },
  flipHint: { fontSize: "13px", color: "#aaa", textAlign: "center", marginBottom: "12px", fontFamily: "sans-serif" },
  cardWrapper: { backgroundColor: "#ffffff", borderRadius: "12px", padding: "40px 32px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", cursor: "pointer", position: "relative", minHeight: "180px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: "24px", border: "1px solid #e0ddd6" },
  difficultBadge: { position: "absolute", top: "12px", right: "12px", backgroundColor: "#fde8e8", color: "#c0392b", fontSize: "12px", fontWeight: "bold", padding: "4px 10px", borderRadius: "999px", fontFamily: "sans-serif", border: "1px solid #f5c6c6" },
  cardSide: { textAlign: "center", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
  cardLabel: { fontSize: "11px", color: "#aaa", letterSpacing: "1px", fontFamily: "sans-serif", marginBottom: "16px" },
  cardText: { fontSize: "20px", fontWeight: "bold", color: "#1a1a1a", marginBottom: "12px" },
  clickToFlip: { fontSize: "13px", color: "#aaa", fontFamily: "sans-serif" },
  statsRow: { display: "flex", gap: "16px", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #f0ede8", width: "100%", justifyContent: "center" },
  knownStat: { fontSize: "12px", color: "#3a7d44", fontFamily: "sans-serif" },
  unknownStat: { fontSize: "12px", color: "#c0392b", fontFamily: "sans-serif" },
  navBtns: { display: "flex", justifyContent: "center", gap: "16px" },
  navBtn: { backgroundColor: "#ffffff", border: "1px solid #ddd", borderRadius: "8px", padding: "10px 24px", fontSize: "14px", color: "#333", cursor: "pointer", fontFamily: "sans-serif" },
};