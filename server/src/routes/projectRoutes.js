import express from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { getallclients, createproject, updateproject, getallprojects, getprojectdetails, deleteproject} from '../controllers/projectcontrollers.js';
import { newMilestone, updateMilestoneStatus, updateMilestone, deleteMilestone } from '../controllers/milestonecontrollers.js';
import { uploadFile } from '../controllers/filecontrollers.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

router.get('/getclients', authenticate ,getallclients);

router.post('/', authenticate, createproject);

router.put('/:projectId', authenticate, updateproject);

router.get('/getallprojects', authenticate, getallprojects);

router.get('/:projectId', authenticate, getprojectdetails);

router.delete('/:projectId', authenticate, deleteproject);

router.post('/:projectId/newMilestone', authenticate, newMilestone);

router.patch('/:projectId/milestone/:milestoneId', authenticate, updateMilestone);

router.put('/:projectId/milestone/:milestoneId', authenticate, updateMilestoneStatus);
    
router.delete('/:projectId/milestone/:milestoneId', authenticate, deleteMilestone);

router.post("/:projectId/files", authenticate, upload.single("file"), uploadFile);

export default router;

