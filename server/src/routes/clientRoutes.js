import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { getclients } from "../controllers/clientscontrollers.js";

const router = express.Router();

router.get('/getclients', authenticate, getclients)

export default router;