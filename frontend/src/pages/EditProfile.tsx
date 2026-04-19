// Srinidhi Sivakaminathan
// UC6 - Edit Profile Page

import { useState, useEffect } from "react";
import React from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const Logo = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="9" y="6" width="20" height="15" rx="3" fill="#a8c5a0" stroke="#6b8f71" strokeWidth="1.5"/>
    <rect x="5" y="13" width="20" height="15" rx="3" fill="white" stroke="#6b8f71" strokeWidth="1.5"/>
  </svg>
);

export default function EditProfile() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errors, setErrors] = useState<{ username?: string; email?: string; password?: string }>({});
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/users/me`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        setUsername(data.username || "");
        setEmail(data.email || "");
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const getInitials = (uname: string) => {
    if (!uname) return "?";
    const parts = uname.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return uname.slice(0, 2).toUpperCase();
  };

  const validate = () => {
    const newErrors: { username?: string; email?: string; password?: string } = {};
    if (!username.trim()) newErrors.username = "Username is required.";
    else if (username.length > 32) newErrors.username = "Username must be 32 characters or less.";
    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Enter a valid email.";
    if (password && password.length < 12) newErrors.password = "Password must be at least 12 characters.";
    else if (password && !/[A-Z]/.test(password)) newErrors.password = "Password must include an uppercase letter.";
    else if (password && !/[0-9]/.test(password)) newErrors.password = "Password must include a number.";
    return newErrors;
  };

  const handleSave = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSuccessMsg("");
      return;
    }

    try {
      const profileRes = await fetch(`${API_BASE}/api/v1/users/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, email }),
      });

      if (!profileRes.ok) {
        const errData = await profileRes.json().catch(() => ({}));
        setErrors({ username: errData.message || "Failed to update profile." });
        return;
      }

      if (password) {
        const passRes = await fetch(`${API_BASE}/api/v1/users/me/password`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ password }),
        });

        if (!passRes.ok) {
          const errData = await passRes.json().catch(() => ({}));
          setErrors({ password: errData.message || "Failed to update password." });
          return;
        }
      }

      setErrors({});
      setSuccessMsg("Profile updated successfully!");
      setPassword("");
    } catch {
      setErrors({});
      setSuccessMsg("Profile updated successfully!");
      setPassword("");
    }
  };

  const handleCancel = () => {
    fetch(`${API_BASE}/api/v1/users/me`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        setUsername(data.username || "");
        setEmail(data.email || "");
      })
      .catch(() => {});
    setPassword("");
    setErrors({});
    setSuccessMsg("");
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError("Please enter your password to confirm.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/v1/users/me`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: deletePassword }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setDeleteError(errData.message || "Incorrect password.");
        return;
      }
      navigate('/');
    } catch {
      navigate('/');
    }
  };

  const handleLogout = () => {
    fetch(`${API_BASE}/api/v1/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
    navigate('/');
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={{ textAlign: 'center', paddingTop: '80px', color: '#888' }}>Loading profile...</div>
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
      </nav>

      <div style={styles.container}>
        <button style={styles.backBtn} onClick={() => navigate('/collections')}>← Back to Home</button>

        <div style={styles.card}>
          <div style={styles.avatar}>{getInitials(username)}</div>
          <h2 style={styles.heading}>Edit Profile</h2>
          {successMsg && <div style={styles.successBanner}>{successMsg}</div>}

          <div style={styles.fieldGroup}>
            <label style={styles.label}>USERNAME</label>
            <input
              style={{ ...styles.input, borderColor: errors.username ? "#e74c3c" : "#ddd" }}
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setErrors({ ...errors, username: undefined }); }}
              placeholder="Your username"
            />
            {errors.username && <span style={styles.errorText}>{errors.username}</span>}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>EMAIL</label>
            <input
              style={{ ...styles.input, borderColor: errors.email ? "#e74c3c" : "#ddd" }}
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: undefined }); }}
              placeholder="your@email.com"
            />
            {errors.email && <span style={styles.errorText}>{errors.email}</span>}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              NEW PASSWORD <span style={styles.optional}>(leave blank to keep)</span>
            </label>
            <input
              style={{ ...styles.input, borderColor: errors.password ? "#e74c3c" : "#ddd" }}
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: undefined }); }}
              placeholder="••••••••••••"
            />
            {errors.password && <span style={styles.errorText}>{errors.password}</span>}
          </div>

          <div style={styles.btnRow}>
            <button style={styles.saveBtn} onClick={handleSave}>Save Changes</button>
            <button style={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
          </div>

          <div style={styles.divider} />

          <button style={styles.logoutBtn} onClick={handleLogout}>Log Out</button>
          <button style={styles.deleteAccountBtn} onClick={() => setShowDeleteConfirm(true)}>Delete Account</button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Delete Account</h3>
            <p style={styles.deleteMsg}>This will permanently delete your account and all your collections. This cannot be undone.</p>
            <label style={styles.modalLabel}>ENTER YOUR PASSWORD TO CONFIRM</label>
            <input
              style={{ ...styles.modalInput, borderColor: deleteError ? '#e74c3c' : '#ddd' }}
              type="password"
              placeholder="••••••••••••"
              value={deletePassword}
              onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(""); }}
            />
            {deleteError && <p style={styles.modalError}>{deleteError}</p>}
            <div style={styles.modalBtns}>
              <button style={{ ...styles.saveBtn, backgroundColor: '#c0392b' }} onClick={handleDeleteAccount}>Delete Account</button>
              <button style={styles.cancelBtn} onClick={() => { setShowDeleteConfirm(false); setDeletePassword(""); setDeleteError(""); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", backgroundColor: "#f5f3ee", fontFamily: "Georgia, serif" },
  navbar: { backgroundColor: "#ffffff", padding: "12px 24px", borderBottom: "1px solid #e0ddd6", display: "flex", alignItems: "center" },
  navBrand: { display: "flex", alignItems: "center", gap: "8px" },
  navTitle: { fontWeight: "bold", fontSize: "18px", color: "#2c2c2c", letterSpacing: "0.5px" },
  container: { maxWidth: "480px", margin: "0 auto", padding: "32px 16px" },
  backBtn: { background: "none", border: "none", color: "#555", fontSize: "14px", cursor: "pointer", marginBottom: "20px", padding: "0" },
  card: { backgroundColor: "#ffffff", borderRadius: "12px", padding: "36px 32px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" },
  avatar: { width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#6b8f71", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold", marginBottom: "16px" },
  heading: { fontSize: "22px", fontWeight: "bold", color: "#1a1a1a", marginBottom: "24px", marginTop: "0" },
  successBanner: { backgroundColor: "#eaf4ec", color: "#3a7d44", padding: "10px 14px", borderRadius: "8px", fontSize: "14px", marginBottom: "16px", border: "1px solid #b5d9bb", fontFamily: "sans-serif" },
  fieldGroup: { marginBottom: "20px", display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "11px", fontWeight: "bold", color: "#888", letterSpacing: "0.8px", fontFamily: "sans-serif" },
  optional: { fontWeight: "normal", color: "#aaa", textTransform: "none", letterSpacing: "0" },
  input: { border: "1px solid #ddd", borderRadius: "8px", padding: "10px 12px", fontSize: "15px", color: "#1a1a1a", outline: "none", fontFamily: "sans-serif" },
  errorText: { color: "#e74c3c", fontSize: "12px", fontFamily: "sans-serif" },
  btnRow: { display: "flex", gap: "12px", marginTop: "8px" },
  saveBtn: { flex: 1, backgroundColor: "#6b8f71", color: "#ffffff", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "14px", fontWeight: "bold", cursor: "pointer", fontFamily: "sans-serif" },
  cancelBtn: { flex: 1, backgroundColor: "#ffffff", color: "#555", border: "1px solid #ddd", borderRadius: "8px", padding: "10px 20px", fontSize: "14px", cursor: "pointer", fontFamily: "sans-serif" },
  divider: { borderTop: "1px solid #f0ede8", margin: "24px 0" },
  logoutBtn: { width: "100%", backgroundColor: "#ffffff", color: "#555", border: "1px solid #ddd", borderRadius: "8px", padding: "10px", fontSize: "14px", cursor: "pointer", fontFamily: "sans-serif", marginBottom: "10px" },
  deleteAccountBtn: { width: "100%", backgroundColor: "#ffffff", color: "#c0392b", border: "1px solid #f5c6c6", borderRadius: "8px", padding: "10px", fontSize: "14px", cursor: "pointer", fontFamily: "sans-serif" },
  overlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modal: { backgroundColor: "#ffffff", padding: "36px", borderRadius: "12px", width: "380px", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" },
  modalTitle: { fontSize: "20px", fontWeight: "bold", color: "#1a1a1a", marginTop: "0", marginBottom: "12px" },
  modalLabel: { fontSize: "11px", fontWeight: "bold", color: "#888", letterSpacing: "0.8px", fontFamily: "sans-serif", display: "block", marginBottom: "6px", marginTop: "16px" },
  modalInput: { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", fontFamily: "sans-serif", boxSizing: "border-box", outline: "none" },
  modalError: { color: "#e74c3c", fontSize: "12px", fontFamily: "sans-serif", margin: "6px 0 0 0" },
  modalBtns: { display: "flex", gap: "12px", marginTop: "24px" },
  deleteMsg: { fontSize: "14px", color: "#555", fontFamily: "sans-serif", lineHeight: "1.6", marginBottom: "8px" },
};