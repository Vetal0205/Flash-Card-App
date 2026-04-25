
// Halema Diab

// Study Mode Page - UC4 (Study/self-grade), UC9 Pause session 

// page handles the entirety of study session, resuming existing sessions, 
// synchronizing state with the server, and handling network failures. 

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PauseSession from '../components/PauseSession';
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
 question: string;
 answer: string;
}




export default function StudyMode() {
 const navigate = useNavigate();
 const { username } = useCurrentUser();
 const { collectionId } = useParams();
 const dropdownRef = useRef<HTMLDivElement>(null);


 const [cards, setCards] = useState<Flashcard[]>([]);
 const [collectionName, setCollectionName] = useState("My Collection");
 const [loading, setLoading] = useState(true);
 const [currentIndex, setCurrentIndex] = useState(0);
 const [isFlipped, setIsFlipped] = useState(false);
 const [known, setKnown] = useState(0);
 const [unknown, setUnknown] = useState(0);
 const [isPaused, setIsPaused] = useState(false);
 const [isComplete, setIsComplete] = useState(false);
 const [showProfileMenu, setShowProfileMenu] = useState(false);
 const [sessionId, setSessionId] = useState<number | null>(null);
 const [pauseError, setPauseError] = useState<string | null>(null);
 const [answerError, setAnswerError] = useState<string | null>(null);
 const [grading, setGrading] = useState(false);


 const getAuthHeaders = (): HeadersInit => bearerAuthHeaders();


 const saveSessionToLocalStorage = useCallback(() => {
   const session = { collectionId, currentIndex, totalCards: cards.length };
   localStorage.setItem(`studySession_${collectionId}`, JSON.stringify(session));
 }, [collectionId, currentIndex, cards.length]);




 const startSession = useCallback((fetchedCards: Flashcard[]) => {
   fetch(`${API_BASE}/api/v1/collections/${collectionId}/study-sessions`, {
     method: 'POST',
     headers: getAuthHeaders(),
   })
     .then(res => res.json())
     .then(data => {
       if (data.session?.sessionID) setSessionId(data.session.sessionID);
       if (typeof data.session?.currentIndex === 'number') setCurrentIndex(data.session.currentIndex);
       const cardOrder: number[] = Array.isArray(data.cardOrder) ? data.cardOrder : [];
       if (cardOrder.length > 0) {
         const cardMap = new Map(fetchedCards.map(c => [c.flashcardID, c]));
         const ordered = cardOrder
           .map(id => cardMap.get(id))
           .filter((c): c is Flashcard => c !== undefined);
         if (ordered.length > 0) setCards(ordered);
       }
     })
     .catch(() => {});
 }, [collectionId]);


 const pauseSession = useCallback(() => {
   if (!sessionId) {
     setPauseError("No active session found");
     setIsPaused(true);
     return;
   }
   fetch(`${API_BASE}/api/v1/collections/${collectionId}/study-sessions/${sessionId}/pause`, {
     method: 'PATCH',
     headers: getAuthHeaders(),
   })
     .then(() => {
       setPauseError(null);
       setIsPaused(true);
     })
     .catch(() => {
       setPauseError("Failed to save progress. Please try again.");
       setIsPaused(true);
     });
 }, [collectionId, sessionId]);


 const resumeSession = useCallback(() => {
   if (!sessionId) return;
   fetch(`${API_BASE}/api/v1/collections/${collectionId}/study-sessions/${sessionId}/resume`, {
     method: 'PATCH',
     headers: getAuthHeaders(),
   })
     .then(() => {
       setPauseError(null);
       setIsPaused(false);
     })
     .catch(() => {
       setPauseError("Failed to resume session.");
     });
 }, [collectionId, sessionId]);


 useEffect(() => {
   let cancelled = false;


   const initialize = async () => {
     // 1 — fetch all flashcards for this collection
     let fetchedCards: Flashcard[] = [];
     try {
       const res = await fetch(
         `${API_BASE}/api/v1/collections/${collectionId}/flashcards`,
         { headers: getAuthHeaders() }
       );
       const data = await res.json();
       fetchedCards = Array.isArray(data) && data.length > 0 ? data : [];
     } catch {
       if (!cancelled) { setCards([]); setLoading(false); }
       return;
     }


     if (!fetchedCards.length) {
       if (!cancelled) { setCards([]); setLoading(false); }
       return;
     }


     if (cancelled) return;


     // 2 — check whether a resumable session already exists
     let activeSession: { sessionID: number; currentIndex: number } | null = null;
     try {
       const activeRes = await fetch(
         `${API_BASE}/api/v1/collections/${collectionId}/study-sessions/active`,
         { headers: getAuthHeaders() }
       );
       const activeData = await activeRes.json().catch(() => null);
       if (activeData && typeof activeData.sessionID === 'number') {
         activeSession = activeData;
       }
     } catch { /* treat as no active session */ }


     // If every card in the deck has already been answered, the session is finished but was
     // never formally closed. Complete it now so POST can create a fresh session below.
     if (activeSession && activeSession.currentIndex >= fetchedCards.length) {
       try {
         await fetch(
           `${API_BASE}/api/v1/collections/${collectionId}/study-sessions/${activeSession.sessionID}/complete`,
           { method: 'PATCH', headers: getAuthHeaders() }
         );
       } catch { /* best-effort; POST will still create a new session */ }
       activeSession = null;
     }


     if (cancelled) return;


     // 3 — two separate paths:
     //   RESUME  (activeSession != null): POST returns the existing session and its stored
     //           cardOrder without creating a new session.
     //   NEW     (activeSession == null): POST creates a fresh session beginning at index 0.
     let sessionPayload: any = null;
     try {
       const startRes = await fetch(
         `${API_BASE}/api/v1/collections/${collectionId}/study-sessions`,
         { method: 'POST', headers: getAuthHeaders() }
       );
       sessionPayload = await startRes.json();
     } catch { /* session could not be initialised; grading will be blocked */ }


     if (cancelled) return;


     // 3.5 — for a resumed session, fetch the summary to restore known/unknown counts.
     //       The StudySession model has no known/unknown fields; they are computed from
     //       the individual answer rows via the summary endpoint.
     let resumedKnown = 0;
     let resumedUnknown = 0;
     if (activeSession !== null) {
       const resumedId = sessionPayload?.session?.sessionID ?? activeSession.sessionID;
       try {
         const summaryRes = await fetch(
           `${API_BASE}/api/v1/collections/${collectionId}/study-sessions/${resumedId}/summary`,
           { headers: getAuthHeaders() }
         );
         const summaryData = await summaryRes.json().catch(() => null);
         if (summaryData && typeof summaryData.known === 'number') resumedKnown = summaryData.known;
         if (summaryData && typeof summaryData.unknown === 'number') resumedUnknown = summaryData.unknown;
       } catch { /* leave counts at 0 on network failure */ }
     }


     if (cancelled) return;


     // 4 — order cards using the cardOrder from the session response
     const cardOrder: number[] = Array.isArray(sessionPayload?.cardOrder) ? sessionPayload.cardOrder : [];
     let orderedCards = fetchedCards;
     if (cardOrder.length > 0) {
       const cardMap = new Map(fetchedCards.map(c => [c.flashcardID, c]));
       const mapped = cardOrder
         .map((id: number) => cardMap.get(id))
         .filter((c): c is Flashcard => c !== undefined);
       if (mapped.length > 0) orderedCards = mapped;
     }


     // 5 — resolve session identity.
     //     RESUME path: prefer POST response; fall back to GET /active data if POST failed.
     //     NEW path:    activeSession is null, so all data must come from POST.
     const sessionSource = sessionPayload?.session ?? activeSession;


     // 6 — clamp the restored index to a valid position.
     //     If the server index equals orderedCards.length, all cards were already answered
     //     in a previous run — jump straight to the complete screen instead of crashing.
     const serverIndex: number = sessionSource?.currentIndex ?? 0;
     const alreadyFinished = serverIndex >= orderedCards.length && orderedCards.length > 0;
     const safeIndex = alreadyFinished
       ? orderedCards.length - 1
       : Math.min(serverIndex, Math.max(0, orderedCards.length - 1));


     // 7 — commit all state atomically; loading gate stays up until this point
     setCards(orderedCards);
     if (sessionSource?.sessionID) setSessionId(sessionSource.sessionID);
     setCurrentIndex(safeIndex);
     setKnown(resumedKnown);
     setUnknown(resumedUnknown);
     if (alreadyFinished) setIsComplete(true);
     setLoading(false);
   };


   void initialize();


   // Collection name is non-blocking and does not affect the loading gate
   fetch(`${API_BASE}/api/v1/collections`, { headers: getAuthHeaders() })
     .then(res => res.json())
     .then(data => {
       if (!cancelled) {
         const col = Array.isArray(data) ? data.find((c: any) => c.collectionID === Number(collectionId)) : null;
         if (col) setCollectionName(col.collectionName);
       }
     })
     .catch(() => {});


   return () => { cancelled = true; };
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
 const progress = totalCards > 0 ? Math.round(((currentIndex + 1) / totalCards) * 100) : 0;
 const recordAnswer = async (flashcardID: number, correct: boolean): Promise<boolean> => {
   if (!sessionId) return false;
   try {
     const res = await fetch(`${API_BASE}/api/v1/collections/${collectionId}/study-sessions/${sessionId}/answers`, {
       method: 'POST',
       headers: getAuthHeaders(),
       body: JSON.stringify({ flashcardID, responseType: correct ? 'known' : 'unknown' }),
     });
     return res.status === 204;
   } catch {
     return false;
   }
 };
 const completeSession = useCallback(async () => {
   if (!sessionId) return;
   fetch(`${API_BASE}/api/v1/collections/${collectionId}/study-sessions/${sessionId}/complete`, {
     method: 'PATCH',
     headers: getAuthHeaders(),
   }).catch(() => {});
 }, [sessionId, collectionId]);


 const advance = (correct: boolean) => {
   if (currentIndex + 1 >= totalCards) { completeSession(); setIsComplete(true); }
   else { setCurrentIndex(currentIndex + 1); setIsFlipped(false); }
 };


 const handleKnown = async () => {
   setGrading(true);
   setAnswerError(null);
   const ok = await recordAnswer(currentCard.flashcardID, true);
   if (!ok) {
     setAnswerError('Failed to save your answer. Please try again.');
     setGrading(false);
     return;
   }
   setKnown(known + 1);
   setGrading(false);
   advance(true);
 };


 const handleUnknown = async () => {
   setGrading(true);
   setAnswerError(null);
   const ok = await recordAnswer(currentCard.flashcardID, false);
   if (!ok) {
     setAnswerError('Failed to save your answer. Please try again.');
     setGrading(false);
     return;
   }
   setUnknown(unknown + 1);
   setGrading(false);
   advance(false);
 };


 const handleRestart = () => {
   setCurrentIndex(0); setIsFlipped(false); setKnown(0);
   setUnknown(0); setIsComplete(false); setSessionId(null);
   localStorage.removeItem(`studySession_${collectionId}`);
   startSession(cards);
 };


 const handleLogout = () => {
   fetch(`${API_BASE}/api/v1/auth/logout`, { method: 'POST', headers: getAuthHeaders() }).catch(() => {});
   try { localStorage.removeItem('minddeck_token'); sessionStorage.removeItem('minddeck_token'); } catch { }
   navigate('/');
 };


 if (loading) return <div style={styles.page}><div style={{ textAlign: 'center', paddingTop: '80px', color: '#888' }}>Loading study session...</div></div>;


 if (totalCards === 0) return (
   <div style={styles.page}>
     <nav style={styles.navbar}><div style={styles.navBrand}><Logo /><span style={styles.navTitle}>MindDeck</span></div></nav>
     <div style={{ textAlign: 'center', paddingTop: '80px' }}>
       <p style={{ color: '#888', fontFamily: 'sans-serif', fontSize: '16px' }}>No flashcards in this collection yet. Add some first!</p>
       <button style={{ ...styles.exitBtn, marginTop: '16px' }} onClick={() => navigate(`/collections/${collectionId}`)}>Back to Collection</button>
     </div>
   </div>
 );


 if (!currentCard) return null;


 return (
   <div style={styles.page}>
     <nav style={styles.navbar}>
       <div style={styles.navBrand}><Logo /><span style={styles.navTitle}>MindDeck</span></div>
       <div style={styles.navRight}>
         <button style={styles.pauseBtn} onClick={pauseSession}>⏸ Pause</button>
         <button style={styles.exitBtn} onClick={async () => {
  if (sessionId) {
    const remaining = cards.slice(currentIndex);
    await Promise.all(remaining.map(card =>
      fetch(`${API_BASE}/api/v1/collections/${collectionId}/study-sessions/${sessionId}/answers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ flashcardID: card.flashcardID, responseType: 'skipped' }),
      }).catch(() => {})
    ));
    await fetch(`${API_BASE}/api/v1/collections/${collectionId}/study-sessions/${sessionId}/complete`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    }).catch(() => {});
  }
  navigate(`/collections/${collectionId}`);
}}>Exit Study</button>
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
       <h2 style={styles.heading}>Study Mode</h2>
       <p style={styles.subtitle}>{collectionName}</p>
       <div style={styles.progressRow}>
         <span style={styles.progressLabel}>Card {Math.min(currentIndex + 1, totalCards)} of {totalCards}</span>
         <span style={styles.progressLabel}>{progress}%</span>
       </div>
       <div style={styles.progressBarBg}><div style={{ ...styles.progressBarFill, width: `${progress}%` }} /></div>
       <div style={styles.statsRow}>
         <span style={styles.knownStat}>✓ Known: {known}</span>
         <span style={styles.unknownStat}>✗ Unknown: {unknown}</span>
       </div>
       <p style={styles.flipHint}>Click card to reveal answer</p>
       <div style={styles.cardWrapper} onClick={() => setIsFlipped(!isFlipped)}>
         <div style={styles.cardSide}>
           <p style={styles.cardLabel}>{isFlipped ? "ANSWER" : "QUESTION"}</p>
           <p style={styles.cardText}>{isFlipped ? currentCard.answer : currentCard.question}</p>
           {!isFlipped && <p style={styles.clickToFlip}>Click to flip</p>}
         </div>
       </div>
       {isFlipped && (
         <React.Fragment>
           <div style={styles.gradeRow}>
             <button
               style={{ ...styles.unknownBtn, opacity: grading ? 0.6 : 1 }}
               onClick={handleUnknown}
               disabled={grading}
             >✗ Didn't Know</button>
             <button
               style={{ ...styles.knownBtn, opacity: grading ? 0.6 : 1 }}
               onClick={handleKnown}
               disabled={grading}
             >✓ Got It</button>
           </div>
           {answerError && (
             <p style={{ color: '#e74c3c', textAlign: 'center', fontFamily: 'sans-serif', fontSize: '13px', marginTop: '12px' }}>
               {answerError}
             </p>
           )}
         </React.Fragment>
       )}
     </div>


     {isPaused && <PauseSession deckName={collectionName} currentCard={currentIndex + 1} totalCards={totalCards} onResume={resumeSession} onDashboard={() => { saveSessionToLocalStorage(); navigate('/collections'); }} errorMessage={pauseError} />}


     {isComplete && (
       <div style={styles.overlay}>
         <div style={styles.modal}>
           <div style={styles.completeIcon}>🎉</div>
           <h3 style={styles.modalTitle}>Session Complete!</h3>
           <p style={styles.modalSubtitle}>You reviewed all {totalCards} cards.</p>
           <div style={styles.summaryRow}>
             <div style={styles.summaryBox}><p style={styles.summaryNum}>{known}</p><p style={styles.summaryLabel}>Known</p></div>
             <div style={styles.summaryDivider} />
             <div style={styles.summaryBox}><p style={{ ...styles.summaryNum, color: '#c0392b' }}>{unknown}</p><p style={styles.summaryLabel}>Unknown</p></div>
             <div style={styles.summaryDivider} />
             <div style={styles.summaryBox}><p style={{ ...styles.summaryNum, color: '#6b8f71' }}>{totalCards > 0 ? Math.round((known / totalCards) * 100) : 0}%</p><p style={styles.summaryLabel}>Score</p></div>
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
 page: { minHeight: '100vh', backgroundColor: '#f5f3ee', fontFamily: 'Georgia, serif' },
 navbar: { backgroundColor: '#ffffff', padding: '12px 24px', borderBottom: '1px solid #e0ddd6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
 navBrand: { display: 'flex', alignItems: 'center', gap: '8px' },
 navTitle: { fontWeight: 'bold', fontSize: '18px', color: '#2c2c2c', letterSpacing: '0.5px' },
 navRight: { display: 'flex', alignItems: 'center', gap: '10px' },
 pauseBtn: { background: 'none', border: '1px solid #ddd', borderRadius: '8px', padding: '6px 16px', fontSize: '14px', color: '#555', cursor: 'pointer', fontFamily: 'sans-serif' },
 exitBtn: { background: 'none', border: '1px solid #ddd', borderRadius: '8px', padding: '6px 16px', fontSize: '14px', color: '#555', cursor: 'pointer', fontFamily: 'sans-serif' },
 profileBtn: { background: 'none', border: '1px solid #ddd', borderRadius: '8px', padding: '6px 16px', fontSize: '14px', color: '#555', cursor: 'pointer', fontFamily: 'sans-serif' },
 dropdown: { position: 'absolute', right: 0, top: '40px', backgroundColor: '#ffffff', border: '1px solid #e0ddd6', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100, minWidth: '150px', overflow: 'hidden' },
 dropdownItem: { display: 'block', width: '100%', padding: '10px 16px', fontSize: '14px', fontFamily: 'sans-serif', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: '#333' },
 container: { maxWidth: '600px', margin: '0 auto', padding: '32px 16px' },
 backBtn: { background: 'none', border: 'none', color: '#555', fontSize: '14px', cursor: 'pointer', marginBottom: '16px', padding: '0' },
 heading: { fontSize: '22px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '4px', marginTop: '0' },
 subtitle: { fontSize: '14px', color: '#888', fontFamily: 'sans-serif', marginBottom: '20px', marginTop: '0' },
 progressRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
 progressLabel: { fontSize: '13px', color: '#888', fontFamily: 'sans-serif' },
 progressBarBg: { width: '100%', height: '6px', backgroundColor: '#e0ddd6', borderRadius: '999px', marginBottom: '12px' },
 progressBarFill: { height: '6px', backgroundColor: '#6b8f71', borderRadius: '999px', transition: 'width 0.3s ease' },
 statsRow: { display: 'flex', gap: '16px', marginBottom: '16px' },
 knownStat: { fontSize: '13px', color: '#3a7d44', fontFamily: 'sans-serif' },
 unknownStat: { fontSize: '13px', color: '#c0392b', fontFamily: 'sans-serif' },
 flipHint: { fontSize: '13px', color: '#aaa', textAlign: 'center', marginBottom: '12px', fontFamily: 'sans-serif' },
 cardWrapper: { backgroundColor: '#ffffff', borderRadius: '12px', padding: '48px 32px 32px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', cursor: 'pointer', minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', border: '1px solid #e0ddd6' },
 cardSide: { textAlign: 'center' },
 cardLabel: { fontSize: '11px', color: '#aaa', letterSpacing: '1px', fontFamily: 'sans-serif', marginBottom: '16px' },
 cardText: { fontSize: '22px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '12px' },
 clickToFlip: { fontSize: '13px', color: '#aaa', fontFamily: 'sans-serif' },
 gradeRow: { display: 'flex', gap: '16px', justifyContent: 'center' },
 unknownBtn: { backgroundColor: '#fde8e8', color: '#c0392b', border: '1px solid #f5c6c6', borderRadius: '8px', padding: '12px 32px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'sans-serif' },
 knownBtn: { backgroundColor: '#eaf4ec', color: '#3a7d44', border: '1px solid #b5d9bb', borderRadius: '8px', padding: '12px 32px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'sans-serif' },
 overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
 modal: { backgroundColor: '#ffffff', padding: '40px', borderRadius: '12px', width: '400px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', textAlign: 'center' },
 completeIcon: { fontSize: '48px', marginBottom: '16px' },
 modalTitle: { fontSize: '22px', fontWeight: 'bold', color: '#1a1a1a', marginTop: '0', marginBottom: '8px' },
 modalSubtitle: { fontSize: '14px', color: '#888', fontFamily: 'sans-serif', marginBottom: '24px' },
 summaryRow: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '28px', backgroundColor: '#f5f3ee', borderRadius: '12px', padding: '20px' },
 summaryBox: { flex: 1, textAlign: 'center' },
 summaryNum: { fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 4px 0' },
 summaryLabel: { fontSize: '12px', color: '#888', fontFamily: 'sans-serif', margin: '0' },
 summaryDivider: { width: '1px', height: '40px', backgroundColor: '#e0ddd6' },
 modalBtns: { display: 'flex', gap: '12px' },
 saveBtn: { flex: 1, backgroundColor: '#6b8f71', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'sans-serif' },
 cancelBtn: { flex: 1, backgroundColor: '#ffffff', color: '#555', border: '1px solid #ddd', borderRadius: '8px', padding: '10px', fontSize: '14px', cursor: 'pointer', fontFamily: 'sans-serif' },
};

