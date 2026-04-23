import UserRepository from '../repositories/UserRepository';
import bcrypt from 'bcrypt';
import User, { UserCreationAttributes, UserOutput, UserUpdateAttributes } from '../models/User';
import { UserSecurityStatusUpdateAttributes } from '../models/UserSecurityStatus';
import { UserSettingsPreferencesUpdateAttributes } from '../models/UserSettingsPreferences';
import { AppError, UnauthorizedError } from '../../errors';

// Business logic for user profile management
// FR-06 (Use Case 6): edit profile (name, email, password)
// FR-09 (Use Case 15): delete account
// FR-21 (Use Case 12): theme preference — do inside SettingsPreferenceService instead? (TODO)

export interface DeleteAccountResult {
    deleted: boolean;
    message: string;
}

const BCRYPT_ROUNDS = 12;

class UserService {
    // Internal helper to keep "user not found" handling consistent.
    private async getUserOrThrow(userID: number): Promise<UserOutput> {
        const user = await UserRepository.findUserById(userID);
        if (!user) {
            throw new AppError('User not found.', 404);
        }
        return user;
    }

    async getProfile(userID: number): Promise<UserOutput> {
        return this.getUserOrThrow(userID);
    }

    async findById(userID: number): Promise<UserOutput | null> {
        return UserRepository.findUserById(userID);
    }

    async findByEmail(email: string): Promise<User | null> {
        return UserRepository.findUserByEmail(email);
    }

    async findByUsername(username: string): Promise<User | null> {
        return UserRepository.findUserByUsername(username);
    }

    async updateSecurityStatus(userID: number, data: UserSecurityStatusUpdateAttributes): Promise<void> {
        await UserRepository.updateSecurityStatus(userID, data);
    }

    async updateProfile(userID: number, data: UserUpdateAttributes): Promise<UserOutput> {
        // FR-06: edit profile fields for the authenticated user.
        const payload: UserUpdateAttributes = {};
        if (data.username !== undefined) {
            payload.username = data.username;
        }
        if (data.email !== undefined) {
            payload.email = data.email;
        }
        if (data.passwordHash !== undefined) {
            payload.passwordHash = data.passwordHash;
        }

        await UserRepository.updateUser(userID, payload);
        return this.getUserOrThrow(userID);
    }

    async changePassword(userID: number, data: { currentPassword: string; newPassword: string }): Promise<void> {
        const { currentPassword, newPassword } = data;

        // FR-06: change password for authenticated user context.
        const profile = await this.getUserOrThrow(userID);

        const fullUser = await UserRepository.findUserByEmail(profile.email);
        if (!fullUser) {
            throw new AppError('User not found.', 404);
        }

        const passwordMatches = await bcrypt.compare(currentPassword, fullUser.passwordHash);
        if (!passwordMatches) {
            throw new UnauthorizedError('Current password is incorrect.');
        }

        const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
        await UserRepository.updateUser(userID, { passwordHash });
    }

    async updateSettings(userID: number, data: UserSettingsPreferencesUpdateAttributes): Promise<void> {
        await UserRepository.updateSettings(userID, data);
    }

    async deleteAccount(userID: number, email: string, password: string): Promise<DeleteAccountResult> {
        // FR-09: require password confirmation before deleting the authenticated account.
        const fullUser = await UserRepository.findUserByEmail(email);
        if (!fullUser) {
            throw new AppError('User not found.', 404);
        }

        const passwordMatches = await bcrypt.compare(password, fullUser.passwordHash);
        if (!passwordMatches) {
            throw new UnauthorizedError('Incorrect Password');
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
