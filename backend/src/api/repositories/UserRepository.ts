import User, { UserCreationAttributes, UserOutput, UserUpdateAttributes } from '../models/User';
import { UserSecurityStatusUpdateAttributes } from '../models/UserSecurityStatus';
import { UserSettingsPreferencesUpdateAttributes } from '../models/UserSettingsPreferences';
import UserSecurityStatus from '../models/UserSecurityStatus';
import UserSettingsPreference from '../models/UserSettingsPreferences';

// Data access for User model
// Called by: AuthService, AuthMiddleware
// FR-25/30: findByCredential, incrementFailedAttempts, lockAccount, resetFailedAttempts

class UserRepository {
    async findUserById(id: number): Promise<UserOutput | null> {
        const user = await User.findByPk(id, {
            attributes: ['userID', 'username', 'email', 'createdAt'],
            raw: true,
        }) as UserOutput | null;

        if (!user) {
            return null;
        }

        // FR-30: include lockout fields for auth checks that use findById.
        const securityStatus = await UserSecurityStatus.findByPk(id, {
            attributes: ['failedLoginAttempts', 'lockoutUntil', 'lastActivityAt'],
            raw: true,
        });

        return {
            ...user,
            ...(securityStatus ?? {}),
        } as UserOutput;
    }

    // Returns full User (including passwordHash) for auth credential verification
    async findUserByEmail(email: string): Promise<User | null> {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return null;
        }

        // FR-30: include lockout fields for login checks.
        const securityStatus = await UserSecurityStatus.findByPk(user.userID, {
            attributes: ['failedLoginAttempts', 'lockoutUntil', 'lastActivityAt'],
            raw: true,
        });
        if (securityStatus) {
            Object.assign(user, securityStatus);
        }

        return user;
    }

    async createUser(data: UserCreationAttributes): Promise<UserOutput> {
        const sequelize = User.sequelize;
        if (!sequelize) {
            throw new Error('Database is not initialized.');
        }

        return sequelize.transaction(async (transaction) => {
            const created = await User.create(data, { transaction });

            // FR-30/FR-21: initialize related security/settings rows for new users.
            await UserSecurityStatus.create({ userID: created.userID }, { transaction });
            await UserSettingsPreference.create({ userID: created.userID }, { transaction });

            const plain = created.get({ plain: true }) as User;
            const { passwordHash, ...safeUser } = plain;
            return safeUser as UserOutput;
        });
    }

    async updateUser(id: number, data: UserUpdateAttributes): Promise<void> {
        await User.update(data, { where: { userID: id } });
    }

    // FR-09: delete account
    async deleteUserById(id: number): Promise<void> {
        await User.destroy({ where: { userID: id } });
    }

    // Covers failedLoginAttempts, lockoutUntil, lastActivityAt
    async updateSecurityStatus(id: number, data: UserSecurityStatusUpdateAttributes): Promise<void> {
        const existing = await UserSecurityStatus.findByPk(id);
        if (!existing) {
            await UserSecurityStatus.create({ userID: id, ...data });
            return;
        }

        await existing.update(data);
    }

    async updateSettings(id: number, data: UserSettingsPreferencesUpdateAttributes): Promise<void> {
        const existing = await UserSettingsPreference.findByPk(id);
        if (!existing) {
            await UserSettingsPreference.create({ userID: id, ...data });
            return;
        }

        await existing.update(data);
    }
    
    // FR-25: username as an alternative login credential
    async findUserByUsername(username: string): Promise<User | null> {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return null;
        }

        // FR-30: include lockout fields for login checks.
        const securityStatus = await UserSecurityStatus.findByPk(user.userID, {
            attributes: ['failedLoginAttempts', 'lockoutUntil', 'lastActivityAt'],
            raw: true,
        });
        if (securityStatus) {
            Object.assign(user, securityStatus);
        }

        return user;
    }
}

export default new UserRepository();
