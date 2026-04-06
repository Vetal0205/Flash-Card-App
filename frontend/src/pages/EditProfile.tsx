// Srinidhi Sivakaminathan
// UC6 - Edit Profile Page
// This page allows a logged in user to update their username, email, and password

import { useState } from "react";
import React from 'react';
import { useNavigate } from 'react-router-dom';

const dummyUser = {
  username: "Jane Doe",
  email: "demo@minddeck.com",
};

export default function EditProfile() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(dummyUser.username);
  const [email, setEmail] = useState(dummyUser.email);
  const [password, setPassword] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errors, setErrors] = useState<{ username?: string; email?: string; password?: string }>({});

  const getInitials = (uname: string) => {
    const parts = uname.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return uname.slice(0, 2).toUpperCase();
  };

  const validate = () => {
    const newErrors: { username?: string; email?: string; password?: string } = {};
    if (!username.trim()) newErrors.username = "Username is required.";
    else if (username.length > 32) newErrors.username = "Username must be 32 characters or less.";
    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Enter a valid email.";
    if (password && password.length < 12)
      newErrors.password = "Password must be at least 12 characters.";
    if (password && !/[A-Z]/.test(password))
      newErrors.password = "Password must include an uppercase letter.";
    if (password && !/[0-9]/.test(password))
      newErrors.password = "Password must include a number.";
    return newErrors;
  };

  const handleSave = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSuccessMsg("");
      return;
    }
    // TODO: Replace with real API call to PATCH /api/v1/users/me
    // Only include password in body if user typed a new one
    const payload: { username: string; email: string; passwordHash?: string } = {
      username,
      email,
      ...(password && { passwordHash: password }),
    };
    console.log("Saving profile:", payload);
    setErrors({});
    setSuccessMsg("Profile updated successfully!");
    setPassword("");
  };

  const handleCancel = () => {
    setUsername(dummyUser.username);
    setEmail(dummyUser.email);
    setPassword("");
    setErrors({});
    setSuccessMsg("");
  };

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
      </nav>

      <div style={styles.container}>
        <button style={styles.backBtn} onClick={() => navigate('/collections')}>
          ← Back to Home
        </button>

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
              onChange={(e) => setUsername(e.target.value)}
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
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
            />
            {errors.password && <span style={styles.errorText}>{errors.password}</span>}
          </div>

          <div style={styles.btnRow}>
            <button style={styles.saveBtn} onClick={handleSave}>Save Changes</button>
            <button style={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      </div>
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
  successBanner: { backgroundColor: "#eaf4ec", color: "#3a7d44", padding: "10px 14px", borderRadius: "8px", fontSize: "14px", marginBottom: "16px", border: "1px solid #b5d9bb" },
  fieldGroup: { marginBottom: "20px", display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "11px", fontWeight: "bold", color: "#888", letterSpacing: "0.8px", fontFamily: "sans-serif" },
  optional: { fontWeight: "normal", color: "#aaa", textTransform: "none", letterSpacing: "0" },
  input: { border: "1px solid #ddd", borderRadius: "8px", padding: "10px 12px", fontSize: "15px", color: "#1a1a1a", outline: "none", fontFamily: "sans-serif" },
  errorText: { color: "#e74c3c", fontSize: "12px", fontFamily: "sans-serif" },
  btnRow: { display: "flex", gap: "12px", marginTop: "8px" },
  saveBtn: { backgroundColor: "#6b8f71", color: "#ffffff", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "14px", fontWeight: "bold", cursor: "pointer", fontFamily: "sans-serif" },
  cancelBtn: { backgroundColor: "#ffffff", color: "#555", border: "1px solid #ddd", borderRadius: "8px", padding: "10px 20px", fontSize: "14px", cursor: "pointer", fontFamily: "sans-serif" },
};