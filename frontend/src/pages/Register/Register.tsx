import { FormEvent, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerRequest } from '../../services/authApi';
import {
  PASSWORD_RULES_ERROR,
  validatePasswordRules,
} from '../../services/passwordRules';

function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage('');

    const name = fullName.trim();
    const user = username.trim();
    const pass = password;

    if (!name || !user || !pass) {
      return;
    }

    if (!validatePasswordRules(pass)) {
      setMessage(PASSWORD_RULES_ERROR);
      return;
    }

    setSubmitting(true);
    try {
      const result = await registerRequest({
        fullName: name,
        username: user,
        password: pass,
      });
      if (result.ok) {
        navigate('/');
        return;
      }
      setMessage(result.error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.logo}>MindDeck</h2>
        <h2 style={styles.title}>Create your account</h2>
        <p style={styles.subtitle}>Fill in your information below</p>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="register-fullname" style={styles.label}>
            FULL NAME
          </label>
          <input
            id="register-fullname"
            style={styles.input}
            type="text"
            placeholder="John Doe"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <label htmlFor="register-username" style={styles.label}>
            EMAIL OR USERNAME
          </label>
          <input
            id="register-username"
            style={styles.input}
            type="text"
            placeholder="you@example.com"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label htmlFor="register-password" style={styles.label}>
            PASSWORD
          </label>
          <input
            id="register-password"
            style={styles.input}
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <ul style={styles.hints}>
            <li>At least 12 characters</li>
            <li>1 uppercase and 1 lowercase</li>
            <li>1 number</li>
          </ul>

          {message ? (
            <p role="alert" style={styles.error}>
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            style={styles.createButton}
            disabled={submitting}
          >
            Create Account
          </button>
        </form>

        <p style={styles.or}>or</p>

        <button
          type="button"
          style={styles.signInButton}
          onClick={() => navigate('/')}
        >
          Sign In
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
  hints: {
    fontSize: '12px',
    color: '#888',
    marginBottom: '15px',
    paddingLeft: '20px',
  },
  error: {
    color: '#b00020',
    fontSize: '13px',
    marginBottom: '10px',
    marginTop: 0,
  },
  createButton: {
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
    color: '#333',
    fontSize: '13px',
    marginBottom: '10px',
  },
  signInButton: {
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

export default Register;
