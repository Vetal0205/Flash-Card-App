//Halema Diab
//frontend code for UC2- New User Sign-Up
//maps to FR-25, FR-26, FR-27, FR-28, FR-29, NFR-10
//This page allows users to create a new account 

import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.logo}>MindDeck</h2>
        <h2 style={styles.title}>Create your account</h2>
        <p style={styles.subtitle}>Fill in your information below</p>

        <label style={styles.label}>FULL NAME</label>
        <input style={styles.input} type="text" placeholder="John Doe" />

        <label style={styles.label}>EMAIL OR USERNAME</label>
        <input style={styles.input} type="text" placeholder="you@example.com" />

        <label style={styles.label}>PASSWORD</label>
        <input style={styles.input} type="password" placeholder="••••••••" />
        <ul style={styles.hints}>
          <li>At least 12 characters</li>
          <li>1 uppercase</li>
          <li>1 number</li>
        </ul>

        <button style={styles.createButton}>Create Account</button>

        <p style={styles.or}>or</p>

        <button style={styles.signInButton} onClick={() => navigate('/')}>
          Sign In
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f5f0eb',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '10px',
    width: '350px',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  logo: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333',
  },
  title: {
    fontSize: '22px',
    fontWeight: 'bold',
    marginBottom: '5px',
    color: '#333',
  },
  subtitle: {
    fontSize: '14px',
    color: '#888',
    marginBottom: '20px',
  },
  label: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#555',
    marginBottom: '5px',
  },
  input: {
    padding: '10px',
    marginBottom: '15px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '14px',
  },
  hints: {
    fontSize: '12px',
    color: '#888',
    marginBottom: '15px',
    paddingLeft: '20px',
  },
  createButton: {
    padding: '10px',
    backgroundColor: '#6b8f71',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '14px',
    cursor: 'pointer',
    marginBottom: '10px',
  },
  or: {
    textAlign: 'center' as const,
    color: '#333',
    fontSize: '13px',
    marginBottom: '10px',
  },
  signInButton: {
    padding: '10px',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '5px',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#333',
  },
};

export default Register;
