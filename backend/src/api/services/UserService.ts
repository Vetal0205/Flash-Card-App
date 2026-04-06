import UserRepository from '../repositories/UserRepository';

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
    async getProfile() {
        throw new Error('Not implemented'); 
    }

    async updateProfile() {
        throw new Error('Not implemented');
    }

    async changePassword() {
        throw new Error('Not implemented');
    }

    async updateSettings() {
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
}

export default new UserService();
