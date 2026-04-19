import { DataTypes, Model, Optional } from 'sequelize';
import { db } from '../../database/config';

// Belongs to User and Collection; Has many StudySessionCardOrder, StudySessionResponse

interface StudySessionAttributes {
    sessionID: number;
    userID: number;
    collectionID: number;
    status: 'active' | 'completed' | 'paused';
    currentIndex: number;
    startedAt: Date;
    resumedAt: Date | null;
    pausedAt: Date | null;
    completedAt: Date | null;
    durationSeconds: number;
}
// Optional fields for creation and update, because either can be auto-generated or not required
export type StudySessionCreationAttributes = Optional<StudySessionAttributes,
    'sessionID' | 'status' | 'currentIndex' | 'startedAt' | 'resumedAt' | 'pausedAt' | 'completedAt' | 'durationSeconds'>;
// Picked fields for update, because only status, currentIndex, resumedAt, pausedAt, completedAt and durationSeconds can be updated
export type StudySessionUpdateAttributes = Partial<
    Pick<StudySessionAttributes, 'status' | 'currentIndex' | 'resumedAt' | 'pausedAt' | 'completedAt' | 'durationSeconds'>
>;

class StudySession extends Model<StudySessionAttributes, StudySessionCreationAttributes>
    implements StudySessionAttributes {
        declare sessionID: number;
        declare userID: number;
        declare collectionID: number;
        declare status: 'active' | 'completed' | 'paused';
        declare currentIndex: number;
        declare startedAt: Date;
        declare resumedAt: Date | null;
        declare pausedAt: Date | null;
        declare completedAt: Date | null;
        declare durationSeconds: number;
    }

StudySession.init(
    {  
        sessionID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        userID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'userID',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        collectionID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'collections',
                key: 'collectionID',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        status: {
            type: DataTypes.ENUM('active', 'completed', 'paused'),
            allowNull: false,
            defaultValue: 'active',
        },
        currentIndex: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        startedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        resumedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        pausedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        completedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        durationSeconds: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },  
    },
    { sequelize: db, timestamps: false, tableName: 'study_sessions' }
);

export default StudySession;
