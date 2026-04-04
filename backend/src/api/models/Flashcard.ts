import { DataTypes, Model, Optional } from 'sequelize';
import { db } from '../../database/config';

// Belongs to Collection

interface FlashcardAttributes {
    flashcardID: number;
    collectionID: number;
    question: string;
    answer: string,
    createdAt: Date;
    updatedAt: Date;
}
// Optional fields for creation and update, because either can be auto-generated or not required
export type FlashcardCreationAttributes = Optional<FlashcardAttributes, 'flashcardID' | 'createdAt' | 'updatedAt'>;
// Picked fields for update, because only question, answer and collectionID can be updated
export type FlashcardUpdateAttributes = Partial<
    Pick<FlashcardAttributes, 'question' | 'answer' | 'collectionID'>
>;

class Flashcard extends Model<FlashcardAttributes, FlashcardCreationAttributes> implements FlashcardAttributes { 
    declare flashcardID: number;
    declare collectionID: number;
    declare question: string;
    declare answer: string;
    declare createdAt: Date;
    declare updatedAt: Date;
}

Flashcard.init(
    {  
        flashcardID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
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
        question: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        answer: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    { sequelize: db, timestamps: true, tableName: 'flashcards' }
);

export default Flashcard;
