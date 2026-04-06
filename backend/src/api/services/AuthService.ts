import UserRepository from '../repositories/UserRepository';
import AppConfig from '../../config/appConfig';
import { MAX_FAILED_LOGIN_ATTEMPTS, ACCOUNT_LOCKOUT_DURATION_MS } from '../../constants';


// Business logic for authentication:
// FR-25: login with username/email; 
// FR-27: password complexity; 
// FR-29: Remember Me; 
// FR-30: lockout;
// NFR-07/08/10

class AuthService {
    // data: { key: type; key: type})
    async register(): Promise<{ token: string }> {
        throw new Error('Not implemented');
    }

    async login(): Promise<{ token: string }> {
        throw new Error('Not implemented');
    }

    async logout(): Promise<void> {
        throw new Error('Not implemented');
    }

    // FR-30: lockout logic
    async incrementFailedAttempts() {
        throw new Error('Not implemented');
    }

    async lockAccount() {
        throw new Error('Not implemented');
    }

    async resetFailedAttempts() {
        throw new Error('Not implemented');
    }

    async updateLastActive() {
        throw new Error('Not implemented');
    }

    async updateSecurityStatus() {
        throw new Error('Not implemented');
    }
}

export default new AuthService();
