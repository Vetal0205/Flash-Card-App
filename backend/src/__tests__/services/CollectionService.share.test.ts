jest.mock('../../api/repositories/CollectionRepository', () => ({
    __esModule: true,
    default: {
        findCollectionById: jest.fn(),
        updateCollection: jest.fn(),
    },
}));

import CollectionService from '../../api/services/CollectionService';
import CollectionRepository from '../../api/repositories/CollectionRepository';
import Collection from '../../api/models/Collection';

type ConfirmationAction = 'Confirm' | 'Cancel' | 'Dismiss';

type ShareCollectionResult = {
    shared: boolean;
    message: string;
    collection: Collection | null;
};

describe('CollectionService share', () => {
    const mockedCollectionRepository = CollectionRepository as jest.Mocked<typeof CollectionRepository>;
    const shareCollection = CollectionService.share as unknown as (
        userID: number,
        collectionID: number,
        confirmation: ConfirmationAction
    ) => Promise<ShareCollectionResult>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shares the owned collection when the user confirms the action', async () => {
        const mockCollection = {
            collectionID: 10,
            userID: 1,
            collectionName: 'Biology Review',
            description: null,
            visibility: 'private',
            createdAt: new Date('2026-03-15T00:00:00.000Z'),
            updatedAt: new Date('2026-03-15T00:00:00.000Z'),
        } as Collection;

        mockedCollectionRepository.findCollectionById.mockResolvedValue(mockCollection);
        mockedCollectionRepository.updateCollection.mockResolvedValue();

        const result = await shareCollection(1, 10, 'Confirm');

        expect(result).toEqual({
            shared: true,
            message: 'Collection shared successfully.',
            collection: expect.objectContaining({
                collectionID: 10,
                visibility: 'public',
            }),
        });
        expect(mockedCollectionRepository.findCollectionById).toHaveBeenCalledWith(10);
        expect(mockedCollectionRepository.updateCollection).toHaveBeenCalledWith(10, { visibility: 'public' });
    });

    it('does not share the collection when the user cancels the action', async () => {
        const result = await shareCollection(1, 10, 'Cancel');

        expect(result).toEqual({
            shared: false,
            message: 'Collection sharing canceled.',
            collection: null,
        });
        expect(mockedCollectionRepository.findCollectionById).not.toHaveBeenCalled();
        expect(mockedCollectionRepository.updateCollection).not.toHaveBeenCalled();
    });

    it('does not share the collection when the confirmation dialog is dismissed', async () => {
        const result = await shareCollection(1, 10, 'Dismiss');

        expect(result).toEqual({
            shared: false,
            message: 'Collection sharing dismissed.',
            collection: null,
        });
        expect(mockedCollectionRepository.findCollectionById).not.toHaveBeenCalled();
        expect(mockedCollectionRepository.updateCollection).not.toHaveBeenCalled();
    });
});
