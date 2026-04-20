import { apiBase } from './apiAuth';

export type LoginResult =
  | { ok: true; token: string }
  | { ok: false; error: string };

export async function loginRequest(
  credential: string,
  password: string,
  rememberMe?: boolean
): Promise<LoginResult> {
  const res = await fetch(`${apiBase()}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential, password, rememberMe }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    message?: string;
    token?: string;
  };
  if (res.ok && data.token) {
    return { ok: true, token: data.token };
  }
  if (res.ok) {
    return { ok: false, error: 'No token returned from server.' };
  }
  const msg =
    res.status === 423 || res.status === 429
      ? (data.message ?? data.error ?? 'Account locked. Too many failed attempts.')
      : (data.message ?? data.error ?? 'Invalid credentials. Please try again.');
  return { ok: false, error: msg };
}

export type RegisterResult = { ok: true } | { ok: false; error: string };

export async function registerRequest(payload: {
  fullName: string;
  username: string;
  password: string;
}): Promise<RegisterResult> {
  const res = await fetch(`${apiBase()}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (res.ok) {
    return { ok: true };
  }
  return {
    ok: false,
    error: data.error ?? 'Could not register',
  };
}
