import express from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { getallclients, createproject, getallprojects, getprojectdetails} from '../controllers/projectcontrollers.js';
import { newMilestone, updateMilestoneStatus } from '../controllers/milestonecontrollers.js';
import { uploadFile } from '../controllers/filecontrollers.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

router.get('/getclients', authenticate ,getallclients);

router.post('/', authenticate, createproject);

router.get('/getallprojects', authenticate, getallprojects);

router.get('/:projectId', authenticate, getprojectdetails);

router.post('/:projectId/newMilestone', authenticate, newMilestone);

router.put('/:projectId/milestone/:milestoneId', authenticate, updateMilestoneStatus);

router.post("/:projectId/files", authenticate, upload.single("file"), uploadFile);

export default router;

