import express from 'express';
import { getnotifications, markAllRead } from '../controllers/notificationcontrollers.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

router.get('/getnotifications', authenticate, getnotifications);

router.post('/mark-read', authenticate, markAllRead);

export default router;