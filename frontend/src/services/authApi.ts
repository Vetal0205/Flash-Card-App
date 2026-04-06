const apiBase = () => process.env.REACT_APP_API_URL ?? '';

export type LoginResult =
  | { ok: true; token: string }
  | { ok: false; error: string };

export async function loginRequest(
  username: string,
  password: string
): Promise<LoginResult> {
  const res = await fetch(`${apiBase()}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    token?: string;
  };
  if (res.ok) {
    return { ok: true, token: data.token ?? 'token' };
  }
  return {
    ok: false,
    error: data.error ?? 'Could not authenticate',
  };
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
