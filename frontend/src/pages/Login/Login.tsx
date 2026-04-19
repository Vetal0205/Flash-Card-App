//Halema Diab
//Frontend code for UC1- User Login With Optional "Remember Me"
//maps to FR-25, FR-26, FR-27, FR-28, FR-29, FR-30, NFR-08, NFR-10
// //This page allows the user to log in, and to stay logged in, or take them to sign up
import { useState } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
export const LOCKOUT_MESSAGE = 'Too many failed attempts. Your account is locked for 60 minutes.';


const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';


function Login() {
 const navigate = useNavigate();
 const [emailOrUsername, setEmailOrUsername] = useState("");
 const [password, setPassword] = useState("");
 const [rememberMe, setRememberMe] = useState(false);
 const [errors, setErrors] = useState<{ emailOrUsername?: string; password?: string; general?: string }>({});
 const [loading, setLoading] = useState(false);


 const validate = () => {
   const newErrors: { emailOrUsername?: string; password?: string } = {};
   if (!emailOrUsername.trim()) newErrors.emailOrUsername = "Email or username is required.";
   if (!password) newErrors.password = "Password is required.";
   return newErrors;
 };


 const handleSignIn = async () => {
   const validationErrors = validate();
   if (Object.keys(validationErrors).length > 0) {
     setErrors(validationErrors);
     return;
   }
   setErrors({});
   setLoading(true);
   try {
     const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ credential: emailOrUsername, password, rememberMe }),
     });
     if (!res.ok) {
       const data = await res.json().catch(() => ({}));
       if (res.status === 423 || res.status === 429) {
  setErrors({ general: data.message || "Account locked. Too many failed attempts. Try again in 60 minutes." });
} else {
  setErrors({ general: data.message || "Invalid credentials. Please try again." });
}
       setLoading(false);
       return;
     }
     const data = await res.json();
     localStorage.setItem('token', data.token);
     navigate('/collections');
   } catch {
     navigate('/collections');
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


       <h2 style={styles.title}>Welcome back</h2>
       <p style={styles.subtitle}>Sign in to continue studying</p>


       {errors.general && (
 <div role="alert" style={styles.errorBanner}>{errors.general}</div>
)}


       <div style={styles.fieldGroup}>
         <label style={styles.label}>EMAIL OR USERNAME</label>
         <input
           style={{ ...styles.input, borderColor: errors.emailOrUsername ? '#e74c3c' : '#e0ddd6' }}
           type="text"
           placeholder="you@example.com"
           value={emailOrUsername}
           onChange={(e) => { setEmailOrUsername(e.target.value); setErrors({ ...errors, emailOrUsername: undefined }); }}
         />
         {errors.emailOrUsername && <p style={styles.errorText}>{errors.emailOrUsername}</p>}
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
       </div>


       <div style={styles.rememberMe}>
         <input
           type="checkbox"
           id="rememberMe"
           checked={rememberMe}
           onChange={(e) => setRememberMe(e.target.checked)}
           style={{ accentColor: '#6b8f71', cursor: 'pointer' }}
         />
         <label htmlFor="rememberMe" style={styles.rememberLabel}>Remember me</label>
       </div>


       <button
         style={{ ...styles.signInButton, opacity: loading ? 0.7 : 1 }}
         onClick={handleSignIn}
         disabled={loading}
       >
         {loading ? "Signing in..." : "Sign In"}
       </button>


       <div style={styles.divider}>
         <div style={styles.dividerLine} />
         <span style={styles.dividerText}>or</span>
         <div style={styles.dividerLine} />
       </div>


       <button style={styles.createButton} onClick={() => navigate('/register')}>
         Create Account
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
 rememberMe: {
   display: 'flex',
   alignItems: 'center',
   gap: '8px',
   marginBottom: '20px',
 },
 rememberLabel: {
   fontSize: '13px',
   color: '#555',
   fontFamily: 'sans-serif',
   cursor: 'pointer',
 },
 signInButton: {
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
 createButton: {
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


export default Login;

