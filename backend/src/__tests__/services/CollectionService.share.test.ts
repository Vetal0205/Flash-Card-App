jest.mock('../../api/repositories/CollectionRepository', () => ({
    __esModule: true,
    default: {
        updateCollection: jest.fn(),
    },
}));

jest.mock('../../api/services/FlashcardService', () => ({
    __esModule: true,
    default: {
        createBulk: jest.fn(),
        getAllByCollection: jest.fn(),
    },
}));

import CollectionService from '../../api/services/CollectionService';
import CollectionRepository from '../../api/repositories/CollectionRepository';
import type Collection from '../../api/models/Collection';
import { ForbiddenError } from '../../errors';

describe('CollectionService share', () => {
    const mockedCollectionRepository = CollectionRepository as jest.Mocked<typeof CollectionRepository>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shares an owned private collection and makes it public', async () => {
        const mockCollection = {
            collectionID: 10,
            userID: 1,
            collectionName: 'Biology Review',
            description: null,
            visibility: 'private',
            createdAt: new Date('2026-03-15T00:00:00.000Z'),
            updatedAt: new Date('2026-03-15T00:00:00.000Z'),
        } as Collection;

        mockedCollectionRepository.updateCollection.mockResolvedValue();

        const result = await CollectionService.share(1, mockCollection);

        expect(result).toEqual({
            shared: true,
            message: 'Collection shared successfully.',
            collection: expect.objectContaining({
                collectionID: 10,
                visibility: 'public',
            }),
        });
        expect(mockedCollectionRepository.updateCollection).toHaveBeenCalledWith(10, { visibility: 'public' });
    });

    it('keeps an already shared collection public without duplicate update work', async () => {
        const mockCollection = {
            collectionID: 10,
            userID: 1,
            collectionName: 'Biology Review',
            description: null,
            visibility: 'public',
            createdAt: new Date('2026-03-15T00:00:00.000Z'),
            updatedAt: new Date('2026-03-15T00:00:00.000Z'),
        } as Collection;

        const result = await CollectionService.share(1, mockCollection);

        expect(result).toEqual({
            shared: true,
            message: 'Collection shared successfully.',
            collection: mockCollection,
        });
        expect(mockedCollectionRepository.updateCollection).not.toHaveBeenCalled();
    });

    it('throws ForbiddenError when a user tries to share a collection they do not own', async () => {
        const mockCollection = {
            collectionID: 10,
            userID: 2,
            collectionName: 'Biology Review',
            description: null,
            visibility: 'private',
            createdAt: new Date('2026-03-15T00:00:00.000Z'),
            updatedAt: new Date('2026-03-15T00:00:00.000Z'),
        } as Collection;

        await expect(CollectionService.share(1, mockCollection)).rejects.toThrow(ForbiddenError);
        expect(mockedCollectionRepository.updateCollection).not.toHaveBeenCalled();
    });
});
