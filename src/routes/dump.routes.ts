import { Router } from 'express';
import { requireUserId } from '../middleware/validate.middleware';
import { storeDump } from '../controllers/dump.controller';

const router = Router();

router.post('/', requireUserId, storeDump);

export default router;
