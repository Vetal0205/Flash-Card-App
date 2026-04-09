// FR-30 and NFR-07: max failed logins before lockout
export const MAX_FAILED_LOGIN_ATTEMPTS = 3;

// NFR-08: lockout duration (ms) — 24 hours
export const ACCOUNT_LOCKOUT_DURATION_MS = 24 * 60 * 60 * 1000;

// FR-16: study session answer types
export const ANSWER = {
    CORRECT: 'correct',
    INCORRECT: 'incorrect',
    SKIPPED: 'skipped'
} as const;

// FR-29: JWT token lifetimes
export const DEFAULT_TOKEN_EXPIRES = '1h';
export const REMEMBER_ME_EXPIRES = '30d';

// FR-23: allowed file upload formats
export const ALLOWED_UPLOAD_FORMATS = ['text/plain'] as const;

// FR-15: collection view modes
export const VIEW_MODE = {
    CARDS: 'cards',
    TABLE: 'table'
} as const;
