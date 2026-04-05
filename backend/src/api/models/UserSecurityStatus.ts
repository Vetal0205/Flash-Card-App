import { DataTypes, Model, Optional } from 'sequelize';
import { db } from '../../database/config';


interface UserSecurityStatusAttributes {
    userID: number;
    failedLoginAttempts: number;
    lockoutUntil: Date | null;
    // meaningful user activity (login, password change, study etc.) 
    lastActivityAt: Date | null;
}
// Optional fields for creation and update, because either can be auto-generated or not required
export type UserSecurityStatusCreationAttributes = Optional<UserSecurityStatusAttributes, 'failedLoginAttempts' | 'lockoutUntil' | 'lastActivityAt' >;
// Optional fields for update, because only failedLoginAttempts, lockoutUntil and lastActivityAt can be updated
export type UserSecurityStatusUpdateAttributes = Partial<
    Pick<UserSecurityStatusAttributes, 'failedLoginAttempts' | 'lockoutUntil' | 'lastActivityAt'>
>;
class UserSecurityStatus extends Model<UserSecurityStatusAttributes, UserSecurityStatusCreationAttributes>  
    implements UserSecurityStatusAttributes {
    declare userID: number;
    declare failedLoginAttempts: number;
    declare lockoutUntil: Date | null;
    declare lastActivityAt: Date | null;
}

UserSecurityStatus.init(
    {
        userID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: {
                model: 'users',
                key: 'userID',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        failedLoginAttempts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        lockoutUntil: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        lastActivityAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    { sequelize: db, timestamps: false, tableName: 'user_security_statuses' }
);

export default UserSecurityStatus;
