import { Router } from 'express';
import authRouter from './auth';
import usersRouter from './users';
import collectionsRouter from './collections';

const router: Router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/collections', collectionsRouter);

export default router;
