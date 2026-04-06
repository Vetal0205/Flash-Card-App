jest.mock('../../api/repositories/UserRepository', () => ({
    __esModule: true,
    default: {
        findUserById: jest.fn(),
        deleteUserById: jest.fn(),
    },
}));

import UserService from '../../api/services/UserService';
import UserRepository from '../../api/repositories/UserRepository';
import { UserOutput } from '../../api/models/User';

type ConfirmationAction = 'Confirm' | 'Cancel' | 'Dismiss';

type DeleteAccountResult = {
    deleted: boolean;
    message: string;
};

describe('UserService deleteAccount', () => {
    const mockedUserRepository = UserRepository as jest.Mocked<typeof UserRepository>;
    const deleteAccount = UserService.deleteAccount as unknown as (
        userID: number,
        confirmation: ConfirmationAction
    ) => Promise<DeleteAccountResult>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deletes the account when the user confirms deletion', async () => {
        const mockUser: UserOutput = {
            userID: 1,
            username: 'user1',
            email: 'user1@gmail.com',
            createdAt: new Date('2026-03-15T00:00:00.000Z'),
        };

        mockedUserRepository.findUserById.mockResolvedValue(mockUser);
        mockedUserRepository.deleteUserById.mockResolvedValue();

        const result = await deleteAccount(1, 'Confirm');

        expect(result).toEqual({
            deleted: true,
            message: 'Account deleted successfully.',
        });
        expect(mockedUserRepository.findUserById).toHaveBeenCalledWith(1);
        expect(mockedUserRepository.deleteUserById).toHaveBeenCalledWith(1);
    });

    it('does not delete the account when the user cancels deletion', async () => {
        const result = await deleteAccount(1, 'Cancel');

        expect(result).toEqual({
            deleted: false,
            message: 'Account deletion canceled.',
        });
        expect(mockedUserRepository.findUserById).not.toHaveBeenCalled();
        expect(mockedUserRepository.deleteUserById).not.toHaveBeenCalled();
    });

    it('does not delete the account when the confirmation dialog is dismissed', async () => {
        const result = await deleteAccount(1, 'Dismiss');

        expect(result).toEqual({
            deleted: false,
            message: 'Account deletion dismissed.',
        });
        expect(mockedUserRepository.findUserById).not.toHaveBeenCalled();
        expect(mockedUserRepository.deleteUserById).not.toHaveBeenCalled();
    });
});
