import { DataTypes, Model, Optional } from 'sequelize';
import { db } from '../../database/config';


interface UserSettingsPreferencesAttributes {
    userID: number;
    isThemeDark: boolean;
    updatedAt: Date;
}
// Optional fields for creation and update, because either can be auto-generated or not required
export type UserSettingsPreferencesCreationAttributes = Optional<UserSettingsPreferencesAttributes, 'isThemeDark' | 'updatedAt'>;
// Optional fields for update, because only isThemeDark can be updated
export type UserSettingsPreferencesUpdateAttributes = Partial<
    Pick<UserSettingsPreferencesAttributes, 'isThemeDark'>
>;

class UserSettingsPreference extends Model<UserSettingsPreferencesAttributes, UserSettingsPreferencesCreationAttributes>  
    implements UserSettingsPreferencesAttributes {
    declare userID: number;
    declare isThemeDark: boolean;
    declare updatedAt: Date;
}

UserSettingsPreference.init(
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
        isThemeDark: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    { sequelize: db, timestamps: true, createdAt: false, tableName: 'user_settings_preference' }
);

export default UserSettingsPreference;
