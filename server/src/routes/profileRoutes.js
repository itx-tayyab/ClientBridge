import express from 'express';
import { getprofile } from '../controllers/profilecontrollers.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

router.get('/', authenticate ,getprofile);

export default router;