const FAILURES_KEY = 'minddeck_login_failures';
const LOCKOUT_UNTIL_KEY = 'minddeck_lockout_until';

const FAILURE_WINDOW_MS = 60 * 60 * 1000;
const LOCKOUT_MS = 24 * 60 * 60 * 1000;
const MAX_FAILURES = 3;

export const LOCKOUT_MESSAGE =
  'Your account is locked due to too many failed attempts. Try again after 24 hours or contact an administrator.';

export function recordLoginFailure(): void {
  const now = Date.now();
  const raw = sessionStorage.getItem(FAILURES_KEY);
  const attempts: number[] = raw ? JSON.parse(raw) : [];
  attempts.push(now);
  const recent = attempts.filter((t) => now - t < FAILURE_WINDOW_MS);
  sessionStorage.setItem(FAILURES_KEY, JSON.stringify(recent));
  if (recent.length >= MAX_FAILURES) {
    sessionStorage.setItem(LOCKOUT_UNTIL_KEY, String(now + LOCKOUT_MS));
  }
}

export function clearLoginFailuresAndLockout(): void {
  sessionStorage.removeItem(FAILURES_KEY);
  sessionStorage.removeItem(LOCKOUT_UNTIL_KEY);
}

export function isAccountLocked(): boolean {
  const untilRaw = sessionStorage.getItem(LOCKOUT_UNTIL_KEY);
  if (!untilRaw) return false;
  const until = parseInt(untilRaw, 10);
  if (Number.isNaN(until) || Date.now() >= until) {
    sessionStorage.removeItem(LOCKOUT_UNTIL_KEY);
    sessionStorage.removeItem(FAILURES_KEY);
    return false;
  }
  return true;
}
