import { DataTypes, Model, Optional } from 'sequelize';
import { db } from '../../database/config';


interface UserFlashcardProgressAttributes {
    userID: number;
    flashcardID: number;
    knownCount: number;
    unknownCount: number;
    isFlaggedDifficult: boolean;
    updatedAt: Date;
}
// Optional fields for creation and update, because either can be auto-generated or not required
export type UserFlashcardProgressCreationAttributes = Optional<UserFlashcardProgressAttributes, 'knownCount' | 'unknownCount' | 'isFlaggedDifficult' | 'updatedAt'>;
// Optional fields for update, because only knownCount, unknownCount and isFlaggedDifficult can be updated
export type UserFlashcardProgressUpdateAttributes = Partial<
    Pick<UserFlashcardProgressAttributes, 'knownCount' | 'unknownCount' | 'isFlaggedDifficult'>
>;
class UserFlashcardProgress extends Model<UserFlashcardProgressAttributes, UserFlashcardProgressCreationAttributes>  
    implements UserFlashcardProgressAttributes {
    declare userID: number;
    declare flashcardID: number;
    declare knownCount: number;
    declare unknownCount: number;
    declare isFlaggedDifficult: boolean;
    declare updatedAt: Date;

}

UserFlashcardProgress.init(
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
        flashcardID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: {
                model: 'flashcards',
                key: 'flashcardID',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        knownCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        unknownCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        isFlaggedDifficult: {
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
    { sequelize: db, timestamps: true, createdAt: false, tableName: 'user_flashcard_progress' }
);

export default UserFlashcardProgress;
