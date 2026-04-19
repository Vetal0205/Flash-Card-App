import Collection, { CollectionCreationAttributes, CollectionUpdateAttributes } from '../models/Collection';

// Data access for Collection model
// Called by: CollectionService
// FR-12: create; 
// FR-13: delete; 
// FR-18:  update (rename, change visibility, etc.);
// FR-07: list all

class CollectionRepository {
    async findAllCollectionsByUser(userID: number): Promise<Collection[]> {
        return Collection.findAll({
            where: { userID },
            order: [['updatedAt', 'DESC']],
        });
    }

    async findCollectionById(id: number): Promise<Collection | null> {
        return Collection.findByPk(id);
    }

    async createCollection(data: CollectionCreationAttributes): Promise<Collection> {
        return Collection.create(data);
    }

    async updateCollection(id: number, data: CollectionUpdateAttributes): Promise<void> {
        await Collection.update(data, { where: { collectionID: id } });
    }

    async deleteCollectionById(id: number): Promise<void> {
        await Collection.destroy({ where: { collectionID: id } });
    }
}

export default new CollectionRepository();
