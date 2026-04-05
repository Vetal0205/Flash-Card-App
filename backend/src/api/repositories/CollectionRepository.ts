import Collection, { CollectionCreationAttributes, CollectionUpdateAttributes } from '../models/Collection';

// Data access for Collection model
// Called by: CollectionService
// FR-12: create; 
// FR-13: delete; 
// FR-18:  update (rename, change visibility, etc.);
// FR-07: list all

class CollectionRepository {
    // TODO: implement each method

    async findAllCollectionsByUser(userID: number): Promise<Collection[]> {
        throw new Error('Not implemented');
    }

    async findCollectionById(id: number): Promise<Collection | null> {
        throw new Error('Not implemented');
    }

    async createCollection(data: CollectionCreationAttributes): Promise<Collection> {
        throw new Error('Not implemented');
    }

    async updateCollection(id: number, data: CollectionUpdateAttributes): Promise<void> {
        throw new Error('Not implemented');
    }

    async deleteCollectionById(id: number): Promise<void> {
        throw new Error('Not implemented');
    }
}

export default new CollectionRepository();
