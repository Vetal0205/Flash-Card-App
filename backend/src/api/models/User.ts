import { DataTypes, Model, Optional } from 'sequelize';
import { db } from '../../database/config';

// FR-25: username/email login; FR-26: password masked; FR-27: complexity enforced in AuthService
// FR-30: failedLoginAttempts + lockedUntil enforce account lockout (NFR-07/08)
// FR-24: lastActiveAt used to detect inactivity for auto-logout

interface UserAttributes {
    userID: number;
    username: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
}
// Optional fields for creation and update, because either can be auto-generated or not required
export type UserCreationAttributes = Optional<UserAttributes, 'userID' | 'createdAt'>;
// Picked fields for update, because only username, email and passwordHash can be updated
export type UserUpdateAttributes = Partial<
    Pick<UserAttributes, 'username' | 'email' | 'passwordHash'>>;
export type UserOutput = Omit<UserAttributes, 'passwordHash'> & {
    failedLoginAttempts?: number;
    lockoutUntil?: Date | null;
    lastActivityAt?: Date | null;
};
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    declare userID: number;
    declare username: string;
    declare email: string;
    declare passwordHash: string;
    declare createdAt: Date;
}

User.init(
    {  
        userID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING(32),
            allowNull: false,
            unique: true,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        passwordHash: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    { sequelize: db, timestamps: false, tableName: 'users' }
);

export default User;
