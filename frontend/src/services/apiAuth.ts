const TOKEN_KEY = 'minddeck_token';

export function apiBase(): string {
  return process.env.REACT_APP_API_URL || 'http://localhost:5000';
}

/** Session first (non–remember-me), then localStorage (remember me). */
export function getMinddeckToken(): string | null {
  const fromSession = sessionStorage.getItem(TOKEN_KEY);
  if (fromSession) return fromSession;
  return localStorage.getItem(TOKEN_KEY);
}

export function bearerAuthHeaders(): HeadersInit {
  const token = getMinddeckToken();
  if (!token) {
    return { 'Content-Type': 'application/json' };
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}
