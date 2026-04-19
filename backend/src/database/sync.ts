import dotenv from 'dotenv';
dotenv.config();

import { db } from './config';
import '../api/models';

async function syncDatabase(): Promise<void> {
    try {
        await db.authenticate();
        await db.sync({ alter: true });
        console.log('Database schema synchronized successfully.');
    } catch (error) {
        console.error('Failed to synchronize database schema.', error);
        process.exitCode = 1;
    } finally {
        await db.close().catch(() => undefined);
    }
}

void syncDatabase();
