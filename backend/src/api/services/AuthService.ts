import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import UserService from './UserService';
import AppConfig from '../../config/appConfig';
import { MAX_FAILED_LOGIN_ATTEMPTS, ACCOUNT_LOCKOUT_DURATION_MS, DEFAULT_TOKEN_EXPIRES, REMEMBER_ME_EXPIRES } from '../../constants';
import { UserSecurityStatusUpdateAttributes } from '../models/UserSecurityStatus';
import { ConflictError, UnauthorizedError, ValidationError } from '../../errors';

// Business logic for authentication:
// FR-25: login with username/email;
// FR-27: password complexity (12+ chars, uppercase, number);
// FR-29: Remember Me;
// FR-30: lockout after MAX_FAILED_LOGIN_ATTEMPTS;
// NFR-07/08/10

const BCRYPT_ROUNDS = 12;
const PASSWORD_MIN_LENGTH = 12;

class AuthService {

    // FR-28: validate email format before any DB work
    private validateEmail(email: string): void {
        // RFC-2822 simplified regex for basic email validation
        const EMAIL_REGEX = /^[-A-Za-z0-9!#$%&'*+/=?^_`{|}~]+(?:\.[-A-Za-z0-9!#$%&'*+/=?^_`{|}~]+)*@(?:[A-Za-z0-9](?:[-A-Za-z0-9]*[A-Za-z0-9])?\.)+[A-Za-z0-9](?:[-A-Za-z0-9]*[A-Za-z0-9])?$/;
        if (!EMAIL_REGEX.test(email)) {
            throw new ValidationError('Invalid email address.');
        }
    }

    // FR-27: enforce password complexity before any DB work
    private validatePassword(password: string): void {
        if (password.length < PASSWORD_MIN_LENGTH) {
            throw new ValidationError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`);
        }
        if (!/[A-Z]/.test(password)) {
            throw new ValidationError('Password must contain at least one uppercase letter.');
        }
        if (!/[0-9]/.test(password)) {
            throw new ValidationError('Password must contain at least one number.');
        }
    }

    async register(data: { username: string; email: string; password: string }): Promise<{ token: string }> {
        if (!data.username) {
            throw new ValidationError('Username is required.');
        }
        this.validateEmail(data.email);
        this.validatePassword(data.password);

        const existing = await UserService.findByEmail(data.email);
        if (existing) {
            throw new ConflictError('Email is already registered.');
        }

        const existingByUsername = await UserService.findByUsername(data.username);
        if (existingByUsername) {
            throw new ConflictError('Username is already taken.');
        }

        const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
        const user = await UserService.create({ username: data.username, email: data.email, passwordHash });

        const token = jwt.sign(
            { id: user.userID },
            AppConfig.app.secret as string,
            { expiresIn: DEFAULT_TOKEN_EXPIRES },
        ) as string;

        return { token };
    }

    async login(data: { credential: string; password: string; rememberMe?: boolean }): Promise<{ token: string }> {
        if (!data.credential || !data.password) {
            throw new ValidationError('Credential and password are required.');
        }

        // FR-25: accept email or username as credential
        const isEmail = data.credential.includes('@');
        const user: any = isEmail
            ? await UserService.findByEmail(data.credential)
            : await UserService.findByUsername(data.credential);

        if (!user) {
            throw new UnauthorizedError();
        }

        // FR-30: reject immediately if account is locked — do not check password
        // lockoutUntil is a Date (eager-loaded from UserSecurityStatus by the repository)
        if (user.lockoutUntil && user.lockoutUntil > new Date()) {
            throw new UnauthorizedError();
        }

        const passwordMatch = await bcrypt.compare(data.password, user.passwordHash);
        if (!passwordMatch) {
            await this.incrementFailedAttempts(user.userID);
            throw new UnauthorizedError();
        }

        // Successful login: clear lockout state
        await this.resetFailedAttempts(user.userID);

        // FR-29: Remember Me -> long-lived token; default -> standard session
        const expiresIn = data.rememberMe ? REMEMBER_ME_EXPIRES : DEFAULT_TOKEN_EXPIRES;
        const token = jwt.sign(
            { id: user.userID },
            AppConfig.app.secret as string,
            { expiresIn },
        ) as string;

        return { token };
    }

    async logout(userID: number): Promise<void> {
        await this.updateLastActive(userID);
    }

    // FR-30: increment failed login counter; lock account when threshold is reached
    async incrementFailedAttempts(userID: number): Promise<void> {
        const user = await UserService.findById(userID);
        // failedLoginAttempts lives on UserSecurityStatus, eager-loaded onto the user row
        const current: number = (user as any)?.failedLoginAttempts ?? 0;
        const next = current + 1;

        const update: UserSecurityStatusUpdateAttributes = { failedLoginAttempts: next };

        if (next >= MAX_FAILED_LOGIN_ATTEMPTS) {
            update.lockoutUntil = new Date(Date.now() + ACCOUNT_LOCKOUT_DURATION_MS);
        }

        await UserService.updateSecurityStatus(userID, update);
    }

    // FR-30, NFR-08: lock account for ACCOUNT_LOCKOUT_DURATION_MS (24 h)
    async lockAccount(userID: number): Promise<void> {
        await UserService.updateSecurityStatus(userID, {
            lockoutUntil: new Date(Date.now() + ACCOUNT_LOCKOUT_DURATION_MS),
        });
    }

    async resetFailedAttempts(userID: number): Promise<void> {
        await UserService.updateSecurityStatus(userID, {
            failedLoginAttempts: 0,
            lockoutUntil: null,
        });
    }

    // FR-24: record meaningful activity for inactivity tracking
    async updateLastActive(userID: number): Promise<void> {
        await UserService.updateSecurityStatus(userID, {
            lastActivityAt: new Date(),
        });
    }

}

export default new AuthService();
