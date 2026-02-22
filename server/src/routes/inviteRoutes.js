import express from "express";
import { getInviteByToken, inviteclient } from "../controllers/invitescontrollers.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = express.Router();

router.post('/', authenticate ,inviteclient);

router.get('/:token', getInviteByToken);

export default router;