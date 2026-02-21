import express from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { freelancerdashboard, clientdashboard } from '../controllers/dashboardcontrollers.js';

const router = express.Router();

router.get('/freelancer', authenticate ,freelancerdashboard);

router.get('/client', authenticate , clientdashboard);
export default router;