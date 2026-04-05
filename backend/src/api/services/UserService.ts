import UserRepository from '../repositories/UserRepository';
import { UserOutput } from '../models/User';
import ServiceError from './ServiceError';

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

    // (Qays) deletes account if account exists
    async deleteAccount(userID: number): Promise<UserOutput> {
        const user = await UserRepository.findUserById(userID);

        if (!user) {
            throw new ServiceError(404, 'User not found.');
        }

        await UserRepository.deleteUserById(userID);

        return user;
    }
}

export default new UserService();
