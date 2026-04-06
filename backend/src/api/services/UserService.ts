import UserRepository from '../repositories/UserRepository';
import { UserOutput } from '../models/User';
import { UserSettingsPreferencesUpdateAttributes } from '../models/UserSettingsPreferences';

// Business logic for user profile management
// FR-06 (Use Case 6): edit profile (name, email, password)
// FR-09 (Use Case 15): delete account
// FR-21 (Use Case 12): theme preference — do inside SettingsPreferenceService instead? (TODO)

class UserService {
    async getProfile(userID: number): Promise<UserOutput> {
        throw new Error('Not implemented');
    }

    async updateProfile(userID: number, data: { username?: string; email?: string }): Promise<UserOutput> {
        throw new Error('Not implemented');
    }

    async changePassword(userID: number, data: { currentPassword: string; newPassword: string }): Promise<void> {
        throw new Error('Not implemented');
    }

    async updateSettings(userID: number, data: UserSettingsPreferencesUpdateAttributes): Promise<void> {
        throw new Error('Not implemented');
    }

    async deleteAccount() {
        throw new Error('Not implemented');
    }
}

export default new UserService();
