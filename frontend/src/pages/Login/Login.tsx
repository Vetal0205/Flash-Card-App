import { FormEvent, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginRequest } from '../../services/authApi';
import {
  clearLoginFailuresAndLockout,
  isAccountLocked,
  LOCKOUT_MESSAGE,
  recordLoginFailure,
} from '../../services/loginLockout';

const AUTH_ERROR = 'Could not authenticate';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage('');

    if (isAccountLocked()) {
      setMessage(LOCKOUT_MESSAGE);
      return;
    }

    const u = username.trim();
    const p = password.trim();
    if (!u || !p) {
      return;
    }

    setSubmitting(true);
    try {
      const result = await loginRequest(u, p);
      if (result.ok) {
        clearLoginFailuresAndLockout();
        navigate('/mock');
        return;
      }
      if (result.error === AUTH_ERROR) {
        recordLoginFailure();
        setMessage(isAccountLocked() ? LOCKOUT_MESSAGE : AUTH_ERROR);
      } else {
        setMessage(result.error);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.logo}>MindDeck</h2>
        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.subtitle}>Sign in to continue studying</p>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="login-username" style={styles.label}>
            EMAIL OR USERNAME
          </label>
          <input
            id="login-username"
            style={styles.input}
            type="text"
            autoComplete="username"
            placeholder="you@example.com"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label htmlFor="login-password" style={styles.label}>
            PASSWORD
          </label>
          <input
            id="login-password"
            style={styles.input}
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div style={styles.rememberMe}>
            <input id="login-remember" type="checkbox" />
            <label htmlFor="login-remember" style={styles.rememberLabel}>
              Remember me
            </label>
          </div>

          {message ? (
            <p role="alert" style={styles.error}>
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            style={styles.signInButton}
            disabled={submitting}
          >
            Sign In
          </button>
        </form>

        <p style={styles.or}>or</p>

        <button
          type="button"
          style={styles.createButton}
          onClick={() => navigate('/register')}
        >
          Create Account
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
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
    flexDirection: 'column',
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
    display: 'block',
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#555',
    marginBottom: '5px',
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px',
    marginBottom: '15px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '14px',
  },
  rememberMe: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '15px',
    fontSize: '14px',
    color: '#333',
  },
  rememberLabel: {
    cursor: 'pointer',
    margin: 0,
  },
  error: {
    color: '#b00020',
    fontSize: '13px',
    marginBottom: '10px',
    marginTop: 0,
  },
  signInButton: {
    width: '100%',
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
    textAlign: 'center',
    color: '#888',
    fontSize: '13px',
    marginBottom: '10px',
  },
  createButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '5px',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#333',
  },
};

export default Login;
