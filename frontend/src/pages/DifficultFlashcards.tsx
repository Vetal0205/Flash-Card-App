// Srinidhi Sivakaminathan
// UC7 - Review Difficult Flashcards Page
// This page shows flashcards that the user previously marked as difficult.
// User can flip cards to see the answer and navigate between them.

import { useState, useEffect, useRef } from "react";
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { bearerAuthHeaders } from '../services/apiAuth';
import { useCurrentUser } from '../pages/useCurrentUser';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Logo = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="9" y="6" width="20" height="15" rx="3" fill="#a8c5a0" stroke="#6b8f71" strokeWidth="1.5"/>
    <rect x="5" y="13" width="20" height="15" rx="3" fill="white" stroke="#6b8f71" strokeWidth="1.5"/>
  </svg>
);

interface Flashcard {
  flashcardID: number;
  collectionID: number;
  question: string;
  answer: string;
  knownCount: number;
  unknownCount: number;
  isFlaggedDifficult: boolean;
}

export default function DifficultFlashcards() {
  const navigate = useNavigate();
  const { username } = useCurrentUser();
  const location = useLocation();
  const collectionId = location.state?.collectionId;
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [unknown, setUnknown] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getAuthHeaders = (): HeadersInit => bearerAuthHeaders();

  useEffect(() => {
    if (!collectionId) {
      setCards([]);
      setLoading(false);
      return;
    }
    fetch(`${API_BASE}/api/v1/collections/${collectionId}/flashcards/flagged`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        setCards(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setCards([]);
        setLoading(false);
      });
  }, [collectionId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalCards = cards.length;
  const currentCard = cards[currentIndex];
  const progress = totalCards > 0 ? Math.round((currentIndex / totalCards) * 100) : 0;

  const handleKnown = () => { setKnown(known + 1); advance(); };
  const handleUnknown = () => { setUnknown(unknown + 1); advance(); };

  const advance = () => {
    if (currentIndex + 1 >= totalCards) {
      setIsComplete(true);
    } else {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnown(0);
    setUnknown(0);
    setIsComplete(false);
  };

  const handleLogout = () => {
    fetch(`${API_BASE}/api/v1/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    }).catch(() => {});
    try {
      localStorage.removeItem('minddeck_token');
      sessionStorage.removeItem('minddeck_token');
    } catch {
      /* ignore */
    }
    navigate('/');
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={{ textAlign: 'center', paddingTop: '80px', color: '#888' }}>Loading difficult flashcards...</div>
      </div>
    );
  }

  if (totalCards === 0) {
    return (
      <div style={styles.page}>
        <nav style={styles.navbar}>
          <div style={styles.navBrand}>
            <Logo />
            <span style={styles.navTitle}>MindDeck</span>
          </div>
          <button style={styles.exitBtn} onClick={() => navigate(`/collections/${collectionId}`)}>Exit Study</button>
        </nav>
        <div style={{ textAlign: 'center', paddingTop: '80px' }}>
          <p style={{ color: '#888', fontFamily: 'sans-serif', fontSize: '16px' }}>No difficult flashcards found. Mark some as difficult first!</p>
          <button style={{ ...styles.cancelBtn, marginTop: '16px' }} onClick={() => navigate(`/collections/${collectionId}`)}>Back to Collection</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>
          <Logo />
          <span style={styles.navTitle}>MindDeck</span>
        </div>
        <div style={styles.navRight}>
          <button style={styles.exitBtn} onClick={() => navigate(`/collections/${collectionId}`)}>Exit Study</button>
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button style={styles.profileBtn} onClick={() => setShowProfileMenu(!showProfileMenu)}>👤 {username}</button>
            {showProfileMenu && (
              <div style={styles.dropdown}>
                <button style={styles.dropdownItem} onClick={() => { setShowProfileMenu(false); navigate('/edit-profile'); }}>Edit Profile</button>
                <button style={{ ...styles.dropdownItem, color: '#c0392b' }} onClick={handleLogout}>Log Out</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div style={styles.container}>
        <button style={styles.backBtn} onClick={() => navigate(`/collections/${collectionId}`)}>← Back to Collection</button>
        <h2 style={styles.heading}>Study: Difficult Cards</h2>
        <p style={styles.subtitle}>{totalCards} difficult cards</p>

        <div style={styles.progressRow}>
          <span style={styles.progressLabel}>Card {Math.min(currentIndex + 1, totalCards)} of {totalCards}</span>
          <span style={styles.progressLabel}>{progress}%</span>
        </div>
        <div style={styles.progressBarBg}>
          <div style={{ ...styles.progressBarFill, width: `${progress}%` }} />
        </div>

        <div style={styles.statsRow}>
          <span style={styles.knownStat}>✓ Known: {known}</span>
          <span style={styles.unknownStat}>✗ Unknown: {unknown}</span>
        </div>

        <p style={styles.flipHint}>Click card to reveal answer</p>

        <div style={styles.cardWrapper} onClick={() => setIsFlipped(!isFlipped)}>
          <div style={styles.difficultBadge}>Difficult</div>
          <div style={styles.cardSide}>
            <p style={styles.cardLabel}>{isFlipped ? "ANSWER" : "QUESTION"}</p>
            <p style={styles.cardText}>{isFlipped ? currentCard.answer : currentCard.question}</p>
            {!isFlipped && <p style={styles.clickToFlip}>Click to flip</p>}
          </div>
        </div>

        {isFlipped && (
          <div style={styles.gradeRow}>
            <button style={styles.unknownBtn} onClick={handleUnknown}>✗ Didn't Know</button>
            <button style={styles.knownBtn} onClick={handleKnown}>✓ Got It</button>
          </div>
        )}
      </div>

      {isComplete && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.completeIcon}>🎉</div>
            <h3 style={styles.modalTitle}>Session Complete!</h3>
            <p style={styles.modalSubtitle}>You reviewed all {totalCards} difficult cards.</p>
            <div style={styles.summaryRow}>
              <div style={styles.summaryBox}>
                <p style={styles.summaryNum}>{known}</p>
                <p style={styles.summaryLabel}>Known</p>
              </div>
              <div style={styles.summaryDivider} />
              <div style={styles.summaryBox}>
                <p style={{ ...styles.summaryNum, color: '#c0392b' }}>{unknown}</p>
                <p style={styles.summaryLabel}>Unknown</p>
              </div>
              <div style={styles.summaryDivider} />
              <div style={styles.summaryBox}>
                <p style={{ ...styles.summaryNum, color: '#6b8f71' }}>
                  {totalCards > 0 ? Math.round((known / totalCards) * 100) : 0}%
                </p>
                <p style={styles.summaryLabel}>Score</p>
              </div>
            </div>
            <div style={styles.modalBtns}>
              <button style={styles.saveBtn} onClick={handleRestart}>Study Again</button>
              <button style={styles.cancelBtn} onClick={() => navigate(`/collections/${collectionId}`)}>Back to Collection</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", backgroundColor: "#f5f3ee", fontFamily: "Georgia, serif" },
  navbar: { backgroundColor: "#ffffff", padding: "12px 24px", borderBottom: "1px solid #e0ddd6", display: "flex", alignItems: "center", justifyContent: "space-between" },
  navBrand: { display: "flex", alignItems: "center", gap: "8px" },
  navTitle: { fontWeight: "bold", fontSize: "18px", color: "#2c2c2c", letterSpacing: "0.5px" },
  navRight: { display: "flex", alignItems: "center", gap: "10px" },
  exitBtn: { background: "none", border: "1px solid #ddd", borderRadius: "8px", padding: "6px 16px", fontSize: "14px", color: "#555", cursor: "pointer", fontFamily: "sans-serif" },
  profileBtn: { background: "none", border: "1px solid #ddd", borderRadius: "8px", padding: "6px 16px", fontSize: "14px", color: "#555", cursor: "pointer", fontFamily: "sans-serif" },
  dropdown: { position: "absolute", right: 0, top: "40px", backgroundColor: "#ffffff", border: "1px solid #e0ddd6", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 100, minWidth: "150px", overflow: "hidden" },
  dropdownItem: { display: "block", width: "100%", padding: "10px 16px", fontSize: "14px", fontFamily: "sans-serif", background: "none", border: "none", textAlign: "left", cursor: "pointer", color: "#333" },
  container: { maxWidth: "600px", margin: "0 auto", padding: "32px 16px" },
  backBtn: { background: "none", border: "none", color: "#555", fontSize: "14px", cursor: "pointer", marginBottom: "16px", padding: "0" },
  heading: { fontSize: "22px", fontWeight: "bold", color: "#1a1a1a", marginBottom: "4px", marginTop: "0" },
  subtitle: { fontSize: "14px", color: "#888", marginBottom: "20px", marginTop: "0", fontFamily: "sans-serif" },
  progressRow: { display: "flex", justifyContent: "space-between", marginBottom: "8px" },
  progressLabel: { fontSize: "13px", color: "#888", fontFamily: "sans-serif" },
  progressBarBg: { width: "100%", height: "6px", backgroundColor: "#e0ddd6", borderRadius: "999px", marginBottom: "12px" },
  progressBarFill: { height: "6px", backgroundColor: "#6b8f71", borderRadius: "999px", transition: "width 0.3s ease" },
  statsRow: { display: "flex", gap: "16px", marginBottom: "16px" },
  knownStat: { fontSize: "13px", color: "#3a7d44", fontFamily: "sans-serif" },
  unknownStat: { fontSize: "13px", color: "#c0392b", fontFamily: "sans-serif" },
  flipHint: { fontSize: "13px", color: "#aaa", textAlign: "center", marginBottom: "12px", fontFamily: "sans-serif" },
  cardWrapper: { backgroundColor: "#ffffff", borderRadius: "12px", padding: "48px 32px 32px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", cursor: "pointer", minHeight: "200px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: "24px", border: "1px solid #e0ddd6", position: "relative" },
  difficultBadge: { position: "absolute", top: "12px", right: "12px", backgroundColor: "#fde8e8", color: "#c0392b", fontSize: "12px", fontWeight: "bold", padding: "4px 10px", borderRadius: "999px", fontFamily: "sans-serif", border: "1px solid #f5c6c6" },
  cardSide: { textAlign: "center" },
  cardLabel: { fontSize: "11px", color: "#aaa", letterSpacing: "1px", fontFamily: "sans-serif", marginBottom: "16px" },
  cardText: { fontSize: "20px", fontWeight: "bold", color: "#1a1a1a", marginBottom: "12px" },
  clickToFlip: { fontSize: "13px", color: "#aaa", fontFamily: "sans-serif" },
  gradeRow: { display: "flex", gap: "16px", justifyContent: "center" },
  unknownBtn: { backgroundColor: "#fde8e8", color: "#c0392b", border: "1px solid #f5c6c6", borderRadius: "8px", padding: "12px 32px", fontSize: "15px", fontWeight: "bold", cursor: "pointer", fontFamily: "sans-serif" },
  knownBtn: { backgroundColor: "#eaf4ec", color: "#3a7d44", border: "1px solid #b5d9bb", borderRadius: "8px", padding: "12px 32px", fontSize: "15px", fontWeight: "bold", cursor: "pointer", fontFamily: "sans-serif" },
  overlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modal: { backgroundColor: "#ffffff", padding: "40px", borderRadius: "12px", width: "400px", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", textAlign: "center" },
  completeIcon: { fontSize: "48px", marginBottom: "16px" },
  modalTitle: { fontSize: "22px", fontWeight: "bold", color: "#1a1a1a", marginTop: "0", marginBottom: "8px" },
  modalSubtitle: { fontSize: "14px", color: "#888", fontFamily: "sans-serif", marginBottom: "24px" },
  summaryRow: { display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "28px", backgroundColor: "#f5f3ee", borderRadius: "12px", padding: "20px" },
  summaryBox: { flex: 1, textAlign: "center" },
  summaryNum: { fontSize: "28px", fontWeight: "bold", color: "#1a1a1a", margin: "0 0 4px 0" },
  summaryLabel: { fontSize: "12px", color: "#888", fontFamily: "sans-serif", margin: "0" },
  summaryDivider: { width: "1px", height: "40px", backgroundColor: "#e0ddd6" },
  modalBtns: { display: "flex", gap: "12px" },
  saveBtn: { flex: 1, backgroundColor: "#6b8f71", color: "#ffffff", border: "none", borderRadius: "8px", padding: "10px", fontSize: "14px", fontWeight: "bold", cursor: "pointer", fontFamily: "sans-serif" },
  cancelBtn: { flex: 1, backgroundColor: "#ffffff", color: "#555", border: "1px solid #ddd", borderRadius: "8px", padding: "10px", fontSize: "14px", cursor: "pointer", fontFamily: "sans-serif" },
};