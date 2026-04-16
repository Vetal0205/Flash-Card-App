// Flashcard List Page
// UC4: Study button, UC13: Search, UC14: Add flashcard, UC16: Share
// UC10 (Import - Aaliyan) and UC11 (Export - Aaliyan) 

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';

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
  isFlaggedDifficult: boolean;
}

export default function FlashcardList() {
  const navigate = useNavigate();
  const { collectionId } = useParams();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [collectionName, setCollectionName] = useState("My Collection");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Flashcard | null>(null);
  const [showEditModal, setShowEditModal] = useState<Flashcard | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [addError, setAddError] = useState("");
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [editError, setEditError] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/flashcards?collectionId=${collectionId}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setFlashcards(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setFlashcards([]);
        setLoading(false);
      });

    fetch(`${API_BASE}/api/v1/collections`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const col = Array.isArray(data) ? data.find((c: any) => c.collectionID === Number(collectionId)) : null;
        if (col) setCollectionName(col.collectionName);
      })
      .catch(() => {});
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

  const filtered = flashcards.filter((f) =>
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      setAddError("Both question and answer are required.");
      return;
    }
    fetch(`${API_BASE}/api/v1/flashcards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ collectionID: Number(collectionId), question: newQuestion.trim(), answer: newAnswer.trim() }),
    })
      .then(res => res.json())
      .then(data => setFlashcards([...flashcards, data]))
      .catch(() => {
        setFlashcards([...flashcards, {
          flashcardID: Date.now(),
          collectionID: Number(collectionId),
          question: newQuestion.trim(),
          answer: newAnswer.trim(),
          isFlaggedDifficult: false,
        }]);
      });
    setNewQuestion("");
    setNewAnswer("");
    setAddError("");
    setShowAddModal(false);
  };

  const handleToggleDifficult = (card: Flashcard) => {
    fetch(`${API_BASE}/api/v1/flashcards/${card.flashcardID}/flag`, {
      method: 'PATCH',
      credentials: 'include',
    }).catch(() => {});
    setFlashcards(flashcards.map((f) =>
      f.flashcardID === card.flashcardID ? { ...f, isFlaggedDifficult: !f.isFlaggedDifficult } : f
    ));
  };

  const handleDelete = () => {
    if (!showDeleteConfirm) return;
    fetch(`${API_BASE}/api/v1/flashcards/${showDeleteConfirm.flashcardID}`, {
      method: 'DELETE',
      credentials: 'include',
    }).catch(() => {});
    setFlashcards(flashcards.filter((f) => f.flashcardID !== showDeleteConfirm.flashcardID));
    setShowDeleteConfirm(null);
  };

  const openEdit = (card: Flashcard) => {
    setShowEditModal(card);
    setEditQuestion(card.question);
    setEditAnswer(card.answer);
    setEditError("");
  };

  const handleEdit = () => {
    if (!editQuestion.trim() || !editAnswer.trim()) {
      setEditError("Both fields are required.");
      return;
    }
    fetch(`${API_BASE}/api/v1/flashcards/${showEditModal?.flashcardID}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ question: editQuestion.trim(), answer: editAnswer.trim() }),
    }).catch(() => {});
    setFlashcards(flashcards.map((f) =>
      f.flashcardID === showEditModal?.flashcardID
        ? { ...f, question: editQuestion.trim(), answer: editAnswer.trim() }
        : f
    ));
    setShowEditModal(null);
  };

  const handleLogout = () => {
    fetch(`${API_BASE}/api/v1/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
    navigate('/');
  };

  const handleShare = () => {
    const link = `${window.location.origin}/collections/${collectionId}`;
    setShareLink(link);
    setShowShareModal(true);
    fetch(`${API_BASE}/api/v1/collections/${collectionId}/share`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={{ textAlign: 'center', paddingTop: '80px', color: '#888' }}>Loading flashcards...</div>
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
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button style={styles.profileBtn} onClick={() => setShowProfileMenu(!showProfileMenu)}>👤 Profile</button>
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
        <button style={styles.backBtn} onClick={() => navigate('/collections')}>← Back to Collections</button>
        <div style={styles.headerRow}>
          <h2 style={styles.heading}>{collectionName}</h2>
          <button style={styles.addBtn} onClick={() => setShowAddModal(true)}>+ Add Flashcard</button>
        </div>

        <div style={styles.actionRow}>
          <button style={styles.studyBtn} onClick={() => navigate(`/collections/${collectionId}/study`)}>Study</button>
          <button style={styles.difficultBtn} onClick={() => navigate('/difficult-flashcards')}>Study Difficult</button>
          {/* UC10 - Import placeholder   */}
          <button style={styles.outlineBtn}>⬆ Import</button>
          {/* UC11 - Export placeholder  */}
          <button style={styles.outlineBtn}>⬇ Export PDF</button>
          <button style={styles.outlineBtn} onClick={handleShare}>🔗 Share</button>
        </div>

        <input
          style={styles.searchBar}
          type="text"
          placeholder="Search flashcards..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Flashcard Question</th>
                <th style={styles.th}>Flashcard Answer</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Is Difficult</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} style={styles.emptyRow}>
                    {searchQuery ? "No flashcards match your search." : "No flashcards yet — add your first one!"}
                  </td>
                </tr>
              ) : (
                filtered.map((card, i) => (
                  <tr key={card.flashcardID} style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#fafaf8' }}>
                    <td style={styles.td}>{card.question}</td>
                    <td style={styles.td}>{card.answer}</td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={card.isFlaggedDifficult}
                        onChange={() => handleToggleDifficult(card)}
                        style={{ cursor: 'pointer', accentColor: '#6b8f71', width: '16px', height: '16px' }}
                      />
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <div style={styles.rowActions}>
                        <button style={styles.editBtn} onClick={() => openEdit(card)}>Edit</button>
                        <button style={styles.deleteBtn} onClick={() => setShowDeleteConfirm(card)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p style={styles.countLabel}>{filtered.length} flashcard{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Add Flashcard Modal */}
      {showAddModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Add Flashcard</h3>
            <label style={styles.modalLabel}>QUESTION</label>
            <textarea style={styles.textarea} placeholder="Enter question..." value={newQuestion} onChange={(e) => { setNewQuestion(e.target.value); setAddError(""); }} />
            <label style={styles.modalLabel}>ANSWER</label>
            <textarea style={styles.textarea} placeholder="Enter answer..." value={newAnswer} onChange={(e) => { setNewAnswer(e.target.value); setAddError(""); }} />
            {addError && <p style={styles.modalError}>{addError}</p>}
            <div style={styles.modalBtns}>
              <button style={styles.saveBtn} onClick={handleAdd}>Add</button>
              <button style={styles.cancelBtn} onClick={() => { setShowAddModal(false); setNewQuestion(""); setNewAnswer(""); setAddError(""); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Flashcard Modal */}
      {showEditModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Edit Flashcard</h3>
            <label style={styles.modalLabel}>QUESTION</label>
            <textarea style={styles.textarea} value={editQuestion} onChange={(e) => { setEditQuestion(e.target.value); setEditError(""); }} />
            <label style={styles.modalLabel}>ANSWER</label>
            <textarea style={styles.textarea} value={editAnswer} onChange={(e) => { setEditAnswer(e.target.value); setEditError(""); }} />
            {editError && <p style={styles.modalError}>{editError}</p>}
            <div style={styles.modalBtns}>
              <button style={styles.saveBtn} onClick={handleEdit}>Save</button>
              <button style={styles.cancelBtn} onClick={() => setShowEditModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Flashcard Modal */}
      {showDeleteConfirm && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Delete Flashcard</h3>
            <p style={styles.deleteMsg}>Are you sure you want to delete this flashcard? This cannot be undone.</p>
            <p style={styles.deletePreview}>"{showDeleteConfirm.question}"</p>
            <div style={styles.modalBtns}>
              <button style={{ ...styles.saveBtn, backgroundColor: '#c0392b' }} onClick={handleDelete}>Delete</button>
              <button style={styles.cancelBtn} onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Share Collection</h3>
            <p style={styles.deleteMsg}>This collection is now public. Share the link below with anyone.</p>
            <label style={styles.modalLabel}>SHARE LINK</label>
            <div style={styles.shareLinkRow}>
              <input
                style={{ ...styles.modalInput, flex: 1, backgroundColor: '#fafaf8' }}
                type="text"
                value={shareLink}
                readOnly
              />
              <button style={styles.copyBtn} onClick={handleCopyLink}>
                {shareCopied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            <div style={styles.modalBtns}>
              <button style={styles.cancelBtn} onClick={() => { setShowShareModal(false); setShareCopied(false); }}>Close</button>
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
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  profileBtn: { background: 'none', border: '1px solid #ddd', borderRadius: '8px', padding: '6px 16px', fontSize: '14px', color: '#555', cursor: 'pointer', fontFamily: 'sans-serif' },
  dropdown: { position: 'absolute', right: 0, top: '40px', backgroundColor: '#ffffff', border: '1px solid #e0ddd6', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100, minWidth: '150px', overflow: 'hidden' },
  dropdownItem: { display: 'block', width: '100%', padding: '10px 16px', fontSize: '14px', fontFamily: 'sans-serif', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: '#333' },
  container: { maxWidth: '960px', margin: '0 auto', padding: '32px 16px' },
  backBtn: { background: 'none', border: 'none', color: '#555', fontSize: '14px', cursor: 'pointer', marginBottom: '16px', padding: '0' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  heading: { fontSize: '22px', fontWeight: 'bold', color: '#1a1a1a', margin: '0' },
  addBtn: { backgroundColor: '#6b8f71', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'sans-serif' },
  actionRow: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
  studyBtn: { backgroundColor: '#6b8f71', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '8px 18px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'sans-serif' },
  difficultBtn: { backgroundColor: '#fde8e8', color: '#c0392b', border: '1px solid #f5c6c6', borderRadius: '8px', padding: '8px 18px', fontSize: '13px', cursor: 'pointer', fontFamily: 'sans-serif' },
  outlineBtn: { background: 'none', border: '1px solid #ddd', borderRadius: '8px', padding: '8px 18px', fontSize: '13px', color: '#555', cursor: 'pointer', fontFamily: 'sans-serif' },
  searchBar: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', fontFamily: 'sans-serif', marginBottom: '20px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#ffffff' },
  tableWrapper: { backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e0ddd6', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', fontSize: '12px', fontWeight: 'bold', color: '#888', fontFamily: 'sans-serif', letterSpacing: '0.5px', borderBottom: '1px solid #e0ddd6', backgroundColor: '#fafaf8', textAlign: 'left' },
  td: { padding: '12px 16px', fontSize: '14px', color: '#1a1a1a', fontFamily: 'sans-serif', borderBottom: '1px solid #f0ede8' },
  emptyRow: { padding: '32px', textAlign: 'center', color: '#aaa', fontSize: '14px', fontFamily: 'sans-serif' },
  rowActions: { display: 'flex', gap: '8px', justifyContent: 'center' },
  editBtn: { background: 'none', border: '1px solid #ddd', borderRadius: '6px', padding: '4px 12px', fontSize: '12px', color: '#555', cursor: 'pointer', fontFamily: 'sans-serif' },
  deleteBtn: { background: 'none', border: '1px solid #f5c6c6', borderRadius: '6px', padding: '4px 12px', fontSize: '12px', color: '#c0392b', cursor: 'pointer', fontFamily: 'sans-serif' },
  countLabel: { fontSize: '12px', color: '#aaa', fontFamily: 'sans-serif', marginTop: '12px', textAlign: 'right' },
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#ffffff', padding: '36px', borderRadius: '12px', width: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' },
  modalTitle: { fontSize: '20px', fontWeight: 'bold', color: '#1a1a1a', marginTop: '0', marginBottom: '20px' },
  modalLabel: { fontSize: '11px', fontWeight: 'bold', color: '#888', letterSpacing: '0.8px', fontFamily: 'sans-serif', display: 'block', marginBottom: '6px', marginTop: '16px' },
  modalInput: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', fontFamily: 'sans-serif', boxSizing: 'border-box', outline: 'none' },
  textarea: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', fontFamily: 'sans-serif', boxSizing: 'border-box', outline: 'none', resize: 'vertical', minHeight: '80px' },
  modalError: { color: '#e74c3c', fontSize: '12px', fontFamily: 'sans-serif', margin: '6px 0 0 0' },
  modalBtns: { display: 'flex', gap: '12px', marginTop: '24px' },
  saveBtn: { flex: 1, backgroundColor: '#6b8f71', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'sans-serif' },
  cancelBtn: { flex: 1, backgroundColor: '#ffffff', color: '#555', border: '1px solid #ddd', borderRadius: '8px', padding: '10px', fontSize: '14px', cursor: 'pointer', fontFamily: 'sans-serif' },
  deleteMsg: { fontSize: '14px', color: '#555', fontFamily: 'sans-serif', lineHeight: '1.6', margin: '0 0 8px 0' },
  deletePreview: { fontSize: '13px', color: '#888', fontFamily: 'sans-serif', fontStyle: 'italic', margin: '0 0 8px 0' },
  shareLinkRow: { display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' },
  copyBtn: { backgroundColor: '#6b8f71', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'sans-serif', whiteSpace: 'nowrap' },
};