import { DataTypes, Model, Optional } from 'sequelize';
import { CollectionAttributes } from './Collection';
import { db } from '../../database/config';

// Composition of Collection — tracks who shared what with whom

// interface CollectionShareAttributes extends CollectionAttributes {}

// class CollectionShare extends Model<CollectionShareAttributes>    implements CollectionShareAttributes {}

// CollectionShare.init(
//     {},
//     { sequelize: db, tableName: 'collection_shares' }
// );

// export default CollectionShare;
