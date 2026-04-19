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
import { AppError } from '../../errors';

describe('UserService deleteAccount', () => {
    const mockedUserRepository = UserRepository as jest.Mocked<typeof UserRepository>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deletes the account for an existing user', async () => {
        const mockUser: UserOutput = {
            userID: 1,
            username: 'user1',
            email: 'user1@gmail.com',
            createdAt: new Date('2026-03-15T00:00:00.000Z'),
        };

        mockedUserRepository.findUserById.mockResolvedValue(mockUser);
        mockedUserRepository.deleteUserById.mockResolvedValue();

        const result = await UserService.deleteAccount(1);

        expect(result).toEqual({
            deleted: true,
            message: 'Account deleted successfully.',
        });
        expect(mockedUserRepository.findUserById).toHaveBeenCalledWith(1);
        expect(mockedUserRepository.deleteUserById).toHaveBeenCalledWith(1);
    });

    it('throws AppError when the user does not exist', async () => {
        mockedUserRepository.findUserById.mockResolvedValue(null);

        await expect(UserService.deleteAccount(999)).rejects.toThrow(AppError);
        await expect(UserService.deleteAccount(999)).rejects.toMatchObject({
            message: 'User not found.',
            statusCode: 404,
        });

        expect(mockedUserRepository.findUserById).toHaveBeenCalledWith(999);
        expect(mockedUserRepository.deleteUserById).not.toHaveBeenCalled();
    });
});
