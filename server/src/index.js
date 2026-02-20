import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import inviteRoutes from './routes/inviteRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import http from "http";
import { initSocket } from "./services/socketIo.js";
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT;

dotenv.config({
    path: './.env'
});

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

const server = http.createServer(app);
initSocket(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/invites', inviteRoutes);
app.use('/projects', projectRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/notifications', notificationRoutes);
app.use('/clients', clientRoutes);
app.use('/messages', messageRoutes);

server.listen(PORT, () => {
    console.log('Starting server...');
    console.log(`Server is running on port ${PORT}`);
});