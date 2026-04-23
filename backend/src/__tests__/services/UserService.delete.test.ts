jest.mock('bcrypt', () => ({
    __esModule: true,
    default: {
        compare: jest.fn(),
    },
}));

jest.mock('../../api/repositories/UserRepository', () => ({
    __esModule: true,
    default: {
        findUserByEmail: jest.fn(),
        deleteUserById: jest.fn(),
    },
}));

import bcrypt from 'bcrypt';
import UserService from '../../api/services/UserService';
import UserRepository from '../../api/repositories/UserRepository';
import User from '../../api/models/User';
import { UnauthorizedError } from '../../errors';

describe('UserService deleteAccount', () => {
    const mockedUserRepository = UserRepository as jest.Mocked<typeof UserRepository>;
    const mockedCompare = bcrypt.compare as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deletes the account for an existing user with the correct password', async () => {
        const fullUser = { passwordHash: 'hashed-password' } as User;

        mockedUserRepository.findUserByEmail.mockResolvedValue(fullUser);
        mockedCompare.mockResolvedValue(true);
        mockedUserRepository.deleteUserById.mockResolvedValue();

        const result = await UserService.deleteAccount(1, 'user1@gmail.com', 'CorrectPassword123!');

        expect(result).toEqual({
            deleted: true,
            message: 'Account deleted successfully.',
        });
        expect(mockedUserRepository.findUserByEmail).toHaveBeenCalledWith('user1@gmail.com');
        expect(mockedCompare).toHaveBeenCalledWith('CorrectPassword123!', 'hashed-password');
        expect(mockedUserRepository.deleteUserById).toHaveBeenCalledWith(1);
    });

    it('throws UnauthorizedError when the password is incorrect', async () => {
        const fullUser = { passwordHash: 'hashed-password' } as User;

        mockedUserRepository.findUserByEmail.mockResolvedValue(fullUser);
        mockedCompare.mockResolvedValue(false);

        await expect(UserService.deleteAccount(1, 'user1@gmail.com', 'wrongpass')).rejects.toThrow(UnauthorizedError);
        await expect(UserService.deleteAccount(1, 'user1@gmail.com', 'wrongpass')).rejects.toMatchObject({
            message: 'Incorrect Password',
            statusCode: 401,
        });

        expect(mockedUserRepository.findUserByEmail).toHaveBeenCalledWith('user1@gmail.com');
        expect(mockedCompare).toHaveBeenCalledWith('wrongpass', 'hashed-password');
        expect(mockedUserRepository.deleteUserById).not.toHaveBeenCalled();
    });

    it('does not delete the account when the password is blank', async () => {
        const fullUser = { passwordHash: 'hashed-password' } as User;

        mockedUserRepository.findUserByEmail.mockResolvedValue(fullUser);
        mockedCompare.mockResolvedValue(false);

        await expect(UserService.deleteAccount(1, 'user1@gmail.com', '')).rejects.toThrow(UnauthorizedError);
        await expect(UserService.deleteAccount(1, 'user1@gmail.com', '')).rejects.toMatchObject({
            message: 'Incorrect Password',
            statusCode: 401,
        });

        expect(mockedUserRepository.findUserByEmail).toHaveBeenCalledWith('user1@gmail.com');
        expect(mockedCompare).toHaveBeenCalledWith('', 'hashed-password');
        expect(mockedUserRepository.deleteUserById).not.toHaveBeenCalled();
    });
});
