import User, { UserCreationAttributes, UserOutput, UserUpdateAttributes } from '../models/User';
import { UserSecurityStatusUpdateAttributes } from '../models/UserSecurityStatus';
import { UserSettingsPreferencesUpdateAttributes } from '../models/UserSettingsPreferences';

// Data access for User model
// Called by: AuthService, AuthMiddleware
// FR-25/30: findByCredential, incrementFailedAttempts, lockAccount, resetFailedAttempts

class UserRepository {
    // TODO: implement each method

    async findUserById(id: number): Promise<UserOutput | null> {
        throw new Error('Not implemented');
    }

    // Returns full User (including passwordHash) for auth credential verification
    async findUserByEmail(email: string): Promise<User | null> {
        throw new Error('Not implemented');
    }

    async createUser(data: UserCreationAttributes): Promise<UserOutput> {
        throw new Error('Not implemented');
    }

    async updateUser(id: number, data: UserUpdateAttributes): Promise<void> {
        throw new Error('Not implemented');
    }

    // FR-09: delete account
    async deleteUserById(id: number): Promise<void> {
        throw new Error('Not implemented');
    }

    // Covers failedLoginAttempts, lockoutUntil, lastActivityAt
    async updateSecurityStatus(id: number, data: UserSecurityStatusUpdateAttributes): Promise<void> {
        throw new Error('Not implemented');
    }

    async updateSettings(id: number, data: UserSettingsPreferencesUpdateAttributes): Promise<void> {
        throw new Error('Not implemented');
    }
}

export default new UserRepository();
