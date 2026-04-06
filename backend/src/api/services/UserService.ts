import UserRepository from '../repositories/UserRepository';

// Business logic for user profile management
// FR-06 (Use Case 6): edit profile (name, email, password)
// FR-09 (Use Case 15): delete account
// FR-21 (Use Case 12): theme preference — do inside SettingsPreferenceService instead? (TODO)

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

    async deleteAccount() {
        throw new Error('Not implemented');
    }
}

export default new UserService();
