// Srinidhi Sivakaminathan
// UC6 - Edit Profile Page

import { useState, useEffect, useCallback } from "react";
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { apiBase, bearerAuthHeaders } from '../services/apiAuth';

const API_BASE = apiBase();

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
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errors, setErrors] = useState<{ username?: string; email?: string; currentPassword?: string; newPassword?: string }>({});
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const getAuthHeaders = (): HeadersInit => bearerAuthHeaders();

  const closeDeleteModal = useCallback(() => {
    setShowDeleteConfirm(false);
    setDeletePassword("");
    setDeleteError("");
  }, []);

  useEffect(() => {
    if (!showDeleteConfirm) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDeleteModal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showDeleteConfirm, closeDeleteModal]);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/users/me`, { headers: getAuthHeaders() })
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
    const newErrors: { username?: string; email?: string; currentPassword?: string; newPassword?: string } = {};
    if (!username.trim()) newErrors.username = "Username is required.";
    else if (username.length > 32) newErrors.username = "Username must be 32 characters or less.";
    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) newErrors.email = "Enter a valid email address.";
    if (newPassword) {
      if (!currentPassword) newErrors.currentPassword = "Current password is required to set a new password.";
      if (newPassword.length < 12) newErrors.newPassword = "Password must be at least 12 characters.";
      else if (!/[A-Z]/.test(newPassword)) newErrors.newPassword = "Password must include an uppercase letter.";
      else if (!/[0-9]/.test(newPassword)) newErrors.newPassword = "Password must include a number.";
    }
    if (currentPassword && !newPassword) {
      newErrors.newPassword = "Please enter a new password.";
    }
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
        headers: getAuthHeaders(),
        body: JSON.stringify({ username, email }),
      });

      if (!profileRes.ok) {
        const errData = await profileRes.json().catch(() => ({}));
        setErrors({ username: errData.message || "Failed to update profile." });
        return;
      }

      if (newPassword && currentPassword) {
        const passRes = await fetch(`${API_BASE}/api/v1/users/me/password`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({ currentPassword, newPassword }),
        });

        if (!passRes.ok) {
          const errData = await passRes.json().catch(() => ({}));
          setErrors({ currentPassword: errData.message || "Incorrect current password." });
          return;
        }
      }

      setErrors({});
      setSuccessMsg("Profile updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      setErrors({});
      setSuccessMsg("Profile updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    }
  };

  const handleCancel = () => {
    fetch(`${API_BASE}/api/v1/users/me`, { headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((data) => {
        setUsername(data.username || "");
        setEmail(data.email || "");
      })
      .catch(() => {});
    setCurrentPassword("");
    setNewPassword("");
    setErrors({});
    setSuccessMsg("");
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      setDeleteError("Incomplete Field");
      return;
    }
    setDeleteError("");
    try {
      const res = await fetch(`${API_BASE}/api/v1/users/me`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ password: deletePassword }),
      });
      if (res.status === 401) {
        await res.json().catch(() => ({}));
        setDeleteError('Incorrect Password');
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = (data as { message?: string; errors?: { msg?: string }[] }).message;
        const firstErr = (data as { errors?: { msg?: string }[] }).errors?.[0]?.msg;
        if (firstErr === 'Incomplete Field' || msg === 'Incomplete Field') {
          setDeleteError('Incomplete Field');
          return;
        }
        setDeleteError("Failed to delete account. Please try again.");
        return;
      }
      try {
        localStorage.removeItem('minddeck_token');
        sessionStorage.removeItem('minddeck_token');
      } catch {
        /* ignore */
      }
      navigate('/register');
    } catch {
      setDeleteError("Failed to delete account. Please try again.");
    }
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
              CURRENT PASSWORD <span style={styles.optional}>(required to change password)</span>
            </label>
            <input
              style={{ ...styles.input, borderColor: errors.currentPassword ? "#e74c3c" : "#ddd" }}
              type="password"
              value={currentPassword}
              onChange={(e) => { setCurrentPassword(e.target.value); setErrors({ ...errors, currentPassword: undefined }); }}
              placeholder="••••••••••••"
            />
            {errors.currentPassword && <span style={styles.errorText}>{errors.currentPassword}</span>}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              NEW PASSWORD <span style={styles.optional}>(leave blank to keep)</span>
            </label>
            <input
              style={{ ...styles.input, borderColor: errors.newPassword ? "#e74c3c" : "#ddd" }}
              type="password"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setErrors({ ...errors, newPassword: undefined }); }}
              placeholder="••••••••••••"
            />
            {errors.newPassword && <span style={styles.errorText}>{errors.newPassword}</span>}
          </div>

          <div style={styles.btnRow}>
            <button style={styles.saveBtn} onClick={handleSave}>Save Changes</button>
            <button style={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
          </div>

          <div style={styles.divider} />

          <button style={styles.logoutBtn} onClick={handleLogout}>Log Out</button>
          <button type="button" style={styles.deleteAccountBtn} onClick={() => { setDeletePassword(""); setDeleteError(""); setShowDeleteConfirm(true); }}>Delete Account</button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div
          role="presentation"
          style={styles.overlay}
          onClick={closeDeleteModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            style={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={styles.modalTitle}>Delete Account</h3>
            <p style={styles.deleteMsg}>This will permanently delete your account and all your collections. This cannot be undone.</p>
            <label style={styles.modalLabel} htmlFor="delete-account-password">CONFIRM PASSWORD</label>
            <input
              id="delete-account-password"
              type="password"
              autoComplete="current-password"
              style={{ ...styles.modalInput, borderColor: deleteError ? '#e74c3c' : '#ddd' }}
              placeholder="Enter your password to confirm"
              value={deletePassword}
              onChange={(e) => {
                setDeletePassword(e.target.value);
                setDeleteError("");
              }}
            />
            {deleteError ? <p style={styles.modalError}>{deleteError}</p> : null}
            <div style={styles.modalBtns}>
              <button type="button" style={{ ...styles.saveBtn, backgroundColor: '#c0392b' }} onClick={() => { void handleDeleteAccount(); }}>Confirm</button>
              <button type="button" style={styles.cancelBtn} onClick={closeDeleteModal}>Cancel</button>
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
  modalLabel: { fontSize: "11px", fontWeight: "bold", color: "#888", letterSpacing: "0.8px", fontFamily: "sans-serif", display: "block", marginBottom: "6px", marginTop: "8px" },
  modalInput: { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", fontFamily: "sans-serif", boxSizing: "border-box", outline: "none" },
  modalError: { color: "#e74c3c", fontSize: "12px", fontFamily: "sans-serif", margin: "6px 0 0 0" },
  modalBtns: { display: "flex", gap: "12px", marginTop: "24px" },
  deleteMsg: { fontSize: "14px", color: "#555", fontFamily: "sans-serif", lineHeight: "1.6", marginBottom: "8px" },
};