import { DataTypes, Model } from 'sequelize';
import { db } from '../../database/config';



interface StudySessionCardOrderAttributes {
    sessionID: number;
    sequenceNumber: number;
    flashcardID: number;
}
// All fields required on creation — no auto-generated or defaulted columns
export type StudySessionCardOrderCreationAttributes = StudySessionCardOrderAttributes;
// Picked fields for update, because only sequenceNumber and flashcardID can be updated
export type StudySessionCardOrderUpdateAttributes = Partial<
    Pick<StudySessionCardOrderAttributes, 'sequenceNumber' | 'flashcardID'>
>;

class StudySessionCardOrder extends Model<StudySessionCardOrderAttributes, StudySessionCardOrderCreationAttributes>
    implements StudySessionCardOrderAttributes {
        declare sessionID: number;
        declare sequenceNumber: number;
        declare flashcardID: number;
    }

StudySessionCardOrder.init(
    {  
        sessionID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: {
                model: 'study_sessions',
                key: 'sessionID',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        sequenceNumber: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
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
    },
    { sequelize: db, timestamps: false, tableName: 'study_session_card_orders' }
);

export default StudySessionCardOrder;
