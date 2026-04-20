// Collections Dashboard - UC3 (Create), UC5 (Delete), UC8 (Rename)

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import RenameCollection from '../components/RenameCollection';
import { bearerAuthHeaders } from '../services/apiAuth';
import { useCurrentUser } from '../pages/useCurrentUser';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

interface Collection {
  collectionID: number;
  collectionName: string;
  description: string | null;
  visibility: 'private' | 'public';
  createdAt: string;
}

const Logo = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="9" y="6" width="20" height="15" rx="3" fill="#a8c5a0" stroke="#6b8f71" strokeWidth="1.5"/>
    <rect x="5" y="13" width="20" height="15" rx="3" fill="white" stroke="#6b8f71" strokeWidth="1.5"/>
  </svg>
);

export default function CollectionsDashboard() {
  const navigate = useNavigate();
  const { username } = useCurrentUser();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionError, setNewCollectionError] = useState("");
  const [renameTarget, setRenameTarget] = useState<Collection | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [showLogout, setShowLogout] = useState(false);

  const getAuthHeaders = (): HeadersInit => bearerAuthHeaders();

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/collections`, {
      headers: getAuthHeaders(),
    })
      .then(res => res.json())
      .then(data => {
        setCollections(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setCollections([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowLogout(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = collections.filter((c) =>
    c?.collectionName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    if (!newCollectionName.trim()) {
      setNewCollectionError("Collection name is required.");
      return;
    }
    if (!/^[a-zA-Z0-9\s]+$/.test(newCollectionName)) {
      setNewCollectionError("Only letters, numbers, and spaces allowed.");
      return;
    }
    const nameExists = collections.some(
      (c) => c.collectionName.toLowerCase() === newCollectionName.trim().toLowerCase()
    );
    if (nameExists) {
      setNewCollectionError("A collection with this name already exists.");
      return;
    }

    fetch(`${API_BASE}/api/v1/collections`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ collectionName: newCollectionName.trim() }),
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => {
            setNewCollectionError(err.message || "Failed to create collection.");
          });
        }
        return res.json().then(data => {
          setCollections([data, ...collections]);
          setNewCollectionName("");
          setNewCollectionError("");
          setShowNewModal(false);
        });
      })
      .catch(() => {
        const newCol: Collection = {
          collectionID: Date.now(),
          collectionName: newCollectionName.trim(),
          description: null,
          visibility: 'private',
          createdAt: new Date().toISOString().split("T")[0],
        };
        setCollections([newCol, ...collections]);
        setNewCollectionName("");
        setNewCollectionError("");
        setShowNewModal(false);
      });
  };

  const handleRename = (newName: string) => {
    if (!renameTarget) return;
    const nameExists = collections.some(
      (c) => c.collectionName.toLowerCase() === newName.toLowerCase() && c.collectionID !== renameTarget.collectionID
    );
    if (nameExists) return;

    fetch(`${API_BASE}/api/v1/collections/${renameTarget.collectionID}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ collectionName: newName }),
    }).catch(() => {});

    setCollections(collections.map((c) =>
      c.collectionID === renameTarget.collectionID ? { ...c, collectionName: newName } : c
    ));
    setRenameTarget(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    fetch(`${API_BASE}/api/v1/collections/${deleteTarget.collectionID}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
      .then(res => {
        if (res.ok) {
          setCollections(collections.filter((c) => c.collectionID !== deleteTarget.collectionID));
          setDeleteTarget(null);
          setDeleteError("");
        } else {
          return res.json().then(err => {
            setDeleteError(err.message || "Failed to delete collection.");
          });
        }
      })
      .catch(() => {
        setDeleteError("Failed to delete collection.");
      });
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
        <div style={{ textAlign: 'center', paddingTop: '80px', color: '#888' }}>Loading collections...</div>
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
            <button style={styles.profileBtn} onClick={() => setShowLogout(!showLogout)}>👤 {username}</button>
            {showLogout && (
              <div style={styles.dropdown}>
                <button style={styles.dropdownItem} onClick={() => { setShowLogout(false); navigate('/edit-profile'); }}>Edit Profile</button>
                <button style={{ ...styles.dropdownItem, color: '#c0392b' }} onClick={handleLogout}>Log Out</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.headerRow}>
          <h2 style={styles.heading}>My Collections</h2>
          <button style={styles.newBtn} onClick={() => setShowNewModal(true)}>+ New Collection</button>
        </div>

        <input
          style={styles.searchBar}
          type="text"
          placeholder="Search collections..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {filtered.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>
              {searchQuery ? "No collections match your search." : "No collections yet — create your first one!"}
            </p>
            {}
          </div>
        ) : (
          <div style={styles.grid}>
            {filtered.map((col) => (
              <div key={col.collectionID} style={styles.card}>
                <div style={styles.cardTop} onClick={() => navigate(`/collections/${col.collectionID}`)}>
                  <Logo />
                  <div style={styles.cardInfo}>
                    <p style={styles.cardName}>{col.collectionName}</p>
                    <p style={styles.cardMeta}>Created {new Date(col.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div style={styles.cardActions}>
                  <button style={styles.studyBtn} onClick={() => navigate(`/collections/${col.collectionID}/study`)}>Study</button>
                  <button style={styles.difficultBtn} onClick={() => navigate('/difficult-flashcards', { state: { collectionId: col.collectionID } })}>Difficult</button>
                  <button style={styles.actionBtn} onClick={() => setRenameTarget(col)}>Rename</button>
                  <button style={styles.deleteBtn} onClick={() => { setDeleteTarget(col); setDeleteError(""); }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Collection Modal */}
      {showNewModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>New Collection</h3>
            <label style={styles.modalLabel}>COLLECTION NAME</label>
            <input
              style={{ ...styles.modalInput, borderColor: newCollectionError ? '#e74c3c' : '#ddd' }}
              type="text"
              placeholder="e.g. Biology 101"
              value={newCollectionName}
              onChange={(e) => { setNewCollectionName(e.target.value); setNewCollectionError(""); }}
            />
            {newCollectionError && <p style={styles.modalError}>{newCollectionError}</p>}
            <div style={styles.modalBtns}>
              <button style={styles.saveBtn} onClick={handleCreate}>Create</button>
              <button style={styles.cancelBtn} onClick={() => { setShowNewModal(false); setNewCollectionName(""); setNewCollectionError(""); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameTarget && (
        <RenameCollection
        currentName={renameTarget.collectionName}
        onSave={handleRename}
        onCancel={() => setRenameTarget(null)}
        existingNames={collections.map(c => c.collectionName)}
      />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Delete Collection</h3>
            <p style={styles.deleteMsg}>
              Are you sure you want to delete <strong>"{deleteTarget.collectionName}"</strong>? This cannot be undone.
            </p>
            {deleteError && <p style={styles.modalError}>{deleteError}</p>}
            <div style={styles.modalBtns}>
              <button style={{ ...styles.saveBtn, backgroundColor: '#c0392b' }} onClick={handleDelete}>Delete</button>
              <button style={styles.cancelBtn} onClick={() => { setDeleteTarget(null); setDeleteError(""); }}>Cancel</button>
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
  container: { maxWidth: '900px', margin: '0 auto', padding: '32px 16px' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  heading: { fontSize: '22px', fontWeight: 'bold', color: '#1a1a1a', margin: '0' },
  newBtn: { backgroundColor: '#6b8f71', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'sans-serif' },
  searchBar: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', fontFamily: 'sans-serif', marginBottom: '24px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#ffffff' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  card: { backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e0ddd6', overflow: 'hidden' },
  cardTop: { padding: '20px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: '15px', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 4px 0' },
  cardMeta: { fontSize: '12px', color: '#aaa', margin: '0', fontFamily: 'sans-serif' },
  cardActions: { borderTop: '1px solid #f0ede8', padding: '10px 12px', display: 'flex', gap: '6px' },
  studyBtn: { backgroundColor: '#6b8f71', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', cursor: 'pointer', fontFamily: 'sans-serif', fontWeight: 'bold' },
  difficultBtn: { backgroundColor: '#fde8e8', color: '#c0392b', border: '1px solid #f5c6c6', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', cursor: 'pointer', fontFamily: 'sans-serif' },
  actionBtn: { background: 'none', border: '1px solid #ddd', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', color: '#555', cursor: 'pointer', fontFamily: 'sans-serif' },
  deleteBtn: { background: 'none', border: '1px solid #f5c6c6', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', color: '#c0392b', cursor: 'pointer', fontFamily: 'sans-serif' },
  emptyState: { textAlign: 'center', paddingTop: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' },
  emptyText: { color: '#aaa', fontFamily: 'sans-serif', fontSize: '14px', margin: '0' },
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#ffffff', padding: '36px', borderRadius: '12px', width: '380px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' },
  modalTitle: { fontSize: '20px', fontWeight: 'bold', color: '#1a1a1a', marginTop: '0', marginBottom: '20px' },
  modalLabel: { fontSize: '11px', fontWeight: 'bold', color: '#888', letterSpacing: '0.8px', fontFamily: 'sans-serif', display: 'block', marginBottom: '6px' },
  modalInput: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', fontFamily: 'sans-serif', boxSizing: 'border-box', outline: 'none' },
  modalError: { color: '#e74c3c', fontSize: '12px', fontFamily: 'sans-serif', margin: '6px 0 0 0' },
  modalBtns: { display: 'flex', gap: '12px', marginTop: '24px' },
  saveBtn: { flex: 1, backgroundColor: '#6b8f71', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'sans-serif' },
  cancelBtn: { flex: 1, backgroundColor: '#ffffff', color: '#555', border: '1px solid #ddd', borderRadius: '8px', padding: '10px', fontSize: '14px', cursor: 'pointer', fontFamily: 'sans-serif' },
  deleteMsg: { fontSize: '14px', color: '#555', fontFamily: 'sans-serif', lineHeight: '1.6', marginBottom: '8px' },
};