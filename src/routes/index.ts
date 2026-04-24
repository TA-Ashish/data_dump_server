import { Router } from 'express';
import dumpRouter from './dump.routes';

const router = Router();

router.use('/dump', dumpRouter);

export default router;
