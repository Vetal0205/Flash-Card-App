import UserRepository from '../repositories/UserRepository';
import User, { UserCreationAttributes, UserOutput } from '../models/User';
import { UserSecurityStatusUpdateAttributes } from '../models/UserSecurityStatus';
import { UserSettingsPreferencesUpdateAttributes } from '../models/UserSettingsPreferences';

// Business logic for user profile management
// FR-06 (Use Case 6): edit profile (name, email, password)
// FR-09 (Use Case 15): delete account
// FR-21 (Use Case 12): theme preference — do inside SettingsPreferenceService instead? (TODO)

export type UserActionConfirmation = 'Confirm' | 'Cancel' | 'Dismiss';

export interface DeleteAccountResult {
    deleted: boolean;
    message: string;
}

class UserService {
    async getProfile(userID: number): Promise<UserOutput> {
        throw new Error('Not implemented');
    }

    async findById(userID: number): Promise<UserOutput | null> {
        throw new Error('Not implemented');
    }

    async findByEmail(email: string): Promise<User | null> {
        throw new Error('Not implemented');
    }

    async findByUsername(username: string): Promise<User | null> {
        throw new Error('Not implemented');
    }

    async updateSecurityStatus(userID: number, data: UserSecurityStatusUpdateAttributes): Promise<void> {
        throw new Error('Not implemented');
    }

    async updateProfile(userID: number, data: UserCreationAttributes): Promise<UserOutput> {
        throw new Error('Not implemented');
    }

    async changePassword(userID: number, data: { currentPassword: string; newPassword: string }): Promise<void> {
        throw new Error('Not implemented');
    }

    async updateSettings(userID: number, data: UserSettingsPreferencesUpdateAttributes): Promise<void> {
        throw new Error('Not implemented');
    }

    async deleteAccount(userID: number, confirmation: UserActionConfirmation): Promise<DeleteAccountResult> {
        if (confirmation === 'Cancel') {
            return {
                deleted: false,
                message: 'Account deletion canceled.',
            };
        }

        if (confirmation === 'Dismiss') {
            return {
                deleted: false,
                message: 'Account deletion dismissed.',
            };
        }

        const user = await UserRepository.findUserById(userID);

        if (!user) {
            throw new Error('User not found.');
        }

        await UserRepository.deleteUserById(userID);

        return {
            deleted: true,
            message: 'Account deleted successfully.',
        };
    }
    async create(data: UserCreationAttributes): Promise<UserOutput> {
        return UserRepository.createUser(data);
    }

}

export default new UserService();
