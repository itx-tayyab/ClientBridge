import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_project", (projectId) => {
      if (!projectId) return;
      socket.join(String(projectId));
      console.log(`Socket ${socket.id} joined project ${projectId}`);
    });

    socket.on("join_dm", (dmRoom) => {
      if (!dmRoom) return;
      socket.join(dmRoom);
      console.log(`Socket ${socket.id} joined DM room ${dmRoom}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};
