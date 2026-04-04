import { DataTypes, Model, Optional } from 'sequelize';
import { db } from '../../database/config';

// Belongs to User; Has many Flashcard, CollectionShare
// TODO
export interface CollectionAttributes {
    collectionID: number;
    userID: number;
    collectionName: string;
    description: string | null;
    visibility: 'private' | 'public';
    createdAt: Date;
    updatedAt: Date;
}
// Optional fields for creation and update, because either can be auto-generated or not required
export type CollectionCreationAttributes = Optional<CollectionAttributes, 'collectionID' | 'description' | 'createdAt' | 'updatedAt' | 'visibility'>;
// Picked fields for update, because only collectionName, description and visibility can be updated
export type CollectionUpdateAttributes = Partial<
    Pick<CollectionAttributes, 'collectionName' | 'description' | 'visibility'>>;

class Collection extends Model<CollectionAttributes, CollectionCreationAttributes> implements CollectionAttributes {
    declare collectionID: number;
    declare userID: number;
    declare collectionName: string;
    declare description: string | null;
    declare visibility: 'private' | 'public';
    declare createdAt: Date;
    declare updatedAt: Date;
}

Collection.init(
    {  
        collectionID: {
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
        collectionName: {
            type: DataTypes.STRING(32),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        visibility: {
            type: DataTypes.ENUM('private', 'public'),
            allowNull: false,
            defaultValue: 'private',
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
    { sequelize: db, timestamps: true, tableName: 'collections' }
);

export default Collection;
