import UserRepository from '../repositories/UserRepository';
import AppConfig from '../../config/appConfig';
import { MAX_FAILED_LOGIN_ATTEMPTS, ACCOUNT_LOCKOUT_DURATION_MS } from '../../constants';
import { UserSecurityStatusUpdateAttributes } from '../models/UserSecurityStatus';


// Business logic for authentication:
// FR-25: login with username/email;
// FR-27: password complexity;
// FR-29: Remember Me;
// FR-30: lockout;
// NFR-07/08/10

class AuthService {
    async register(data: { username: string; email: string; password: string }): Promise<{ token: string }> {
        throw new Error('Not implemented');
    }

    async login(data: { credential: string; password: string; rememberMe?: boolean }): Promise<{ token: string }> {
        throw new Error('Not implemented');
    }

    async logout(userID: number): Promise<void> {
        throw new Error('Not implemented');
    }

    // FR-30: lockout logic
    async incrementFailedAttempts(userID: number): Promise<void> {
        throw new Error('Not implemented');
    }

    async lockAccount(userID: number): Promise<void> {
        throw new Error('Not implemented');
    }

    async resetFailedAttempts(userID: number): Promise<void> {
        throw new Error('Not implemented');
    }

    async updateLastActive(userID: number): Promise<void> {
        throw new Error('Not implemented');
    }

    async updateSecurityStatus(userID: number, data: UserSecurityStatusUpdateAttributes): Promise<void> {
        throw new Error('Not implemented');
    }
}

export default new AuthService();
