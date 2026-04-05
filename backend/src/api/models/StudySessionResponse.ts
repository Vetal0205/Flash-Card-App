import { DataTypes, Model, Optional } from 'sequelize';
import { db } from '../../database/config';



interface StudySessionResponseAttributes {
    responseID: number;
    sessionID: number;
    flashcardID: number;
    responseType: 'known' | 'unknown' | 'skipped';
    respondedAt: Date;
}
// Optional fields for creation and update, because either can be auto-generated or not required
export type StudySessionResponseCreationAttributes = Optional<StudySessionResponseAttributes, 'responseID' | 'respondedAt'>;
// Picked fields for update, because only responseType can be updated
export type StudySessionResponseUpdateAttributes = Partial<
    Pick<StudySessionResponseAttributes, 'responseType'>
>;
class StudySessionResponse extends Model<StudySessionResponseAttributes, StudySessionResponseCreationAttributes>
    implements StudySessionResponseAttributes {
        declare responseID: number;
        declare sessionID: number;
        declare flashcardID: number;
        declare responseType: 'known' | 'unknown' | 'skipped';
        declare respondedAt: Date;
    }

StudySessionResponse.init(
    {  
        responseID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        sessionID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'study_sessions',
                key: 'sessionID',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        flashcardID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'flashcards',
                key: 'flashcardID',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        responseType: {
            type: DataTypes.ENUM('known', 'unknown', 'skipped'),
            allowNull: false,
        },
        respondedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    { sequelize: db, timestamps: false, tableName: 'study_session_responses' }
);

export default StudySessionResponse;
