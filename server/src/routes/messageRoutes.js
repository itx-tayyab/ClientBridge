import { Router } from "express";
import { sendMessage, getMessages } from "../controllers/messagecontrollers.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();

router.post("/", authenticate, sendMessage);

router.get("/:projectId", authenticate, getMessages);

//router.get("/conversations", authenticate, getConversations);
//router.get("/direct/:otherUserId", authenticate, getDirectMessages);

export default router;