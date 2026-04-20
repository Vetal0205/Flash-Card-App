//Halema Diab
//frontend code for UC2- New User Sign-Up
//maps to FR-25, FR-26, FR-27, FR-28, FR-29, NFR-10
//This page allows users to create a new account

import { useState } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ fullName?: string; username?: string; email?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  const isLongEnough = password.length >= 12;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const validate = () => {
    const newErrors: { fullName?: string; username?: string; email?: string; password?: string } = {};
    if (!fullName.trim()) newErrors.fullName = "Full name is required.";
    else if (fullName.trim().split(" ").filter(p => p.length > 0).length < 2) newErrors.fullName = "Please enter your first and last name.";
    if (!username.trim()) newErrors.username = "Username is required.";
    else if (username.length > 32) newErrors.username = "Username must be 32 characters or less.";
    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) newErrors.email = "Enter a valid email address.";    if (!password) newErrors.password = "Password is required.";
    else if (!isLongEnough) newErrors.password = "Password must be at least 12 characters.";
    else if (!hasUppercase) newErrors.password = "Password must include an uppercase letter.";
    else if (!hasNumber) newErrors.password = "Password must include a number.";
    return newErrors;
  };

  const handleCreate = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, fullName }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrors({ general: data.message || "Registration failed. Please try again." });
        setLoading(false);
        return;
      }
      const data = await res.json();
      localStorage.setItem('minddeck_token', data.token);
      navigate('/collections');
    } catch {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="9" y="6" width="20" height="15" rx="3" fill="#a8c5a0" stroke="#6b8f71" strokeWidth="1.5"/>
            <rect x="5" y="13" width="20" height="15" rx="3" fill="white" stroke="#6b8f71" strokeWidth="1.5"/>
          </svg>
          <span style={styles.logoText}>MindDeck</span>
        </div>

        <h2 style={styles.title}>Create your account</h2>
        <p style={styles.subtitle}>Fill in your information below</p>

        {errors.general && (
          <div style={styles.errorBanner}>{errors.general}</div>
        )}

        <div style={styles.fieldGroup}>
          <label style={styles.label}>FULL NAME</label>
          <input
            style={{ ...styles.input, borderColor: errors.fullName ? '#e74c3c' : '#e0ddd6' }}
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => { setFullName(e.target.value); setErrors({ ...errors, fullName: undefined }); }}
          />
          {errors.fullName && <p style={styles.errorText}>{errors.fullName}</p>}
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>USERNAME</label>
          <input
            style={{ ...styles.input, borderColor: errors.username ? '#e74c3c' : '#e0ddd6' }}
            type="text"
            placeholder="johndoe123"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setErrors({ ...errors, username: undefined }); }}
          />
          {errors.username && <p style={styles.errorText}>{errors.username}</p>}
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>EMAIL</label>
          <input
            style={{ ...styles.input, borderColor: errors.email ? '#e74c3c' : '#e0ddd6' }}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: undefined }); }}
          />
          {errors.email && <p style={styles.errorText}>{errors.email}</p>}
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>PASSWORD</label>
          <input
            style={{ ...styles.input, borderColor: errors.password ? '#e74c3c' : '#e0ddd6' }}
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: undefined }); }}
          />
          {errors.password && <p style={styles.errorText}>{errors.password}</p>}

          <div style={styles.hints}>
            <p style={{ ...styles.hint, color: isLongEnough ? '#3a7d44' : '#aaa' }}>
              {isLongEnough ? '✓' : '○'} At least 12 characters
            </p>
            <p style={{ ...styles.hint, color: hasUppercase ? '#3a7d44' : '#aaa' }}>
              {hasUppercase ? '✓' : '○'} 1 uppercase letter
            </p>
            <p style={{ ...styles.hint, color: hasNumber ? '#3a7d44' : '#aaa' }}>
              {hasNumber ? '✓' : '○'} 1 number
            </p>
          </div>
        </div>

        <button
          style={{ ...styles.createButton, opacity: loading ? 0.7 : 1 }}
          onClick={handleCreate}
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <div style={styles.dividerLine} />
        </div>

        <button style={styles.signInButton} onClick={() => navigate('/')}>
          Sign In
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f3ee',
    fontFamily: 'Georgia, serif',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '48px 40px',
    borderRadius: '16px',
    width: '380px',
    maxWidth: '90vw',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    border: '1px solid #e0ddd6',
    margin: '0 auto',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '28px',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#2c2c2c',
    letterSpacing: '0.5px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: '6px',
    marginTop: '0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#888',
    marginBottom: '28px',
    marginTop: '0',
    fontFamily: 'sans-serif',
  },
  errorBanner: {
    backgroundColor: '#fde8e8',
    color: '#c0392b',
    border: '1px solid #f5c6c6',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    fontFamily: 'sans-serif',
    marginBottom: '16px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '16px',
  },
  label: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#888',
    letterSpacing: '0.8px',
    fontFamily: 'sans-serif',
  },
  input: {
    padding: '11px 14px',
    borderRadius: '8px',
    border: '1px solid #e0ddd6',
    fontSize: '14px',
    color: '#1a1a1a',
    outline: 'none',
    fontFamily: 'sans-serif',
    backgroundColor: '#fafaf8',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: '12px',
    margin: '0',
    fontFamily: 'sans-serif',
  },
  hints: {
    marginTop: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  hint: {
    fontSize: '12px',
    fontFamily: 'sans-serif',
    margin: '0',
    transition: 'color 0.2s ease',
  },
  createButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#6b8f71',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: 'sans-serif',
    marginBottom: '16px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#e0ddd6',
  },
  dividerText: {
    fontSize: '13px',
    color: '#aaa',
    fontFamily: 'sans-serif',
  },
  signInButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'white',
    border: '1px solid #e0ddd6',
    borderRadius: '8px',
    fontSize: '15px',
    cursor: 'pointer',
    color: '#333',
    fontFamily: 'sans-serif',
    fontWeight: 'bold',
  },
};

export default Register;