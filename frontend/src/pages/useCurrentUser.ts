import { useState, useEffect } from 'react';
import { getMinddeckToken } from '../services/apiAuth';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export function useCurrentUser() {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = getMinddeckToken();
    if (!token) return;
    fetch(`${API_BASE}/api/v1/users/me`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setUsername(data.username || ""))
      .catch(() => {});
  }, []);

  return { username };
}