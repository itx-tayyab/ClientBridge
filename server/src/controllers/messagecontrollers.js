import { PrismaClient } from "@prisma/client";
import { getIO } from "../services/socketIo.js";

const prisma = new PrismaClient();
// 1. Send Message
export const sendMessage = async (req , res) => {
  try {
    const { projectId, text } = req.body;
    const senderId = req.user?.id;

    const newMessage = await prisma.message.create({
      data: {
        text,
        projectId: Number(projectId) || 0, // Use 0 for DMs
        senderId: Number(senderId),
      },
      include: {
        sender: { select: { id: true, name: true, role: true } } 
      }
    });

    // 👇 REAL TIME MAGIC: Emit to everyone in this project room or DM room
    const io = getIO();
    
    // Check if it's a DM (projectId string starts with "dm_")
    if (typeof projectId === "string" && projectId.startsWith("dm_")) {
      io.to(projectId).emit("receive_dm", newMessage);
    } else {
      io.to(String(projectId)).emit("receive_message", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Send Message Error:", error);
    res.status(500).json({ message: "Error sending message" });
  }
};

// 2. Get Messages (History)
export const getMessages = async (req,res) => {
  try {
    const { projectId } = req.params;

    const messages = await prisma.message.findMany({
      where: { projectId: Number(projectId) },
      include: {
        sender: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: "asc" } 
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages" });
  }
};

export const getConversations = async (req, res) => {
  try {

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const messages = await prisma.message.findMany({
      where: {projectId: Number(projectId)},
      include: {
        sender: { select: { id: true, name: true } }
      }
    })

    res.status(200).json(messages); 
    
  } catch (error) {
    res.status(500).json({message: "Server Error"});
  }
}


// Includes both message history AND all project collaborators
// export const getConversations = async (req, res) => {
//   try {
//     const userId = req.user?.id;

//     if (!userId) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     // Get all messages for this user (for last message & time)
//     const messages = await prisma.message.findMany({
//       where: {
//         OR: [
//           { senderId: Number(userId) },
//           { project: { OR: [
//               { freelancerId: Number(userId) },
//               { clientId: Number(userId) }
//             ]}
//           }
//         ]
//       },
//       include: {
//         sender: { select: { id: true, name: true } },
//         project: { select: { id: true, name: true, clientId: true, freelancerId: true } }
//       },
//       orderBy: { createdAt: "desc" }
//     });

//     // Build map of conversations from messages
//     const conversationMap = new Map();
    
//     for (const msg of messages) {
//       const otherUserId = msg.senderId === userId ? 
//         (msg.project.freelancerId === userId ? msg.project.clientId : msg.project.freelancerId) :
//         msg.senderId;

//       if (!conversationMap.has(otherUserId)) {
//         conversationMap.set(otherUserId, {
//           otherId: otherUserId,
//           otherUser: null,
//           projectName: msg.project.name,
//           lastMsg: msg.text,
//           lastTime: msg.createdAt
//         });
//       }
//     }

//     // Also fetch all project collaborators (even without messages)
//     const projects = await prisma.project.findMany({
//       where: {
//         OR: [
//           { freelancerId: Number(userId) },
//           { clientId: Number(userId) }
//         ]
//       },
//       include: {
//         freelancer: { select: { id: true, name: true, email: true, role: true } },
//         client: { select: { id: true, name: true, email: true, role: true } }
//       }
//     });

//     // Add missing collaborators to conversation map
//     const addedIds = new Set(conversationMap.keys());
//     for (const project of projects) {
//       const otherUserId = project.freelancerId === userId ? project.clientId : project.freelancerId;
//       const otherUser = project.freelancerId === userId ? project.client : project.freelancer;

//       if (!addedIds.has(otherUserId)) {
//         conversationMap.set(otherUserId, {
//           otherId: otherUserId,
//           otherUser: otherUser,
//           projectName: project.name,
//           lastMsg: "No messages yet",
//           lastTime: new Date(0)
//         });
//       } else {
//         // Update otherUser info if already in map but didn't have user data
//         const existing = conversationMap.get(otherUserId);
//         if (!existing.otherUser) {
//           existing.otherUser = otherUser;
//         }
//       }
//     }

//     const conversations = Array.from(conversationMap.values())
//       .filter(c => c.otherUser)
//       .sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime));

//     res.json(conversations);
//   } catch (error) {
//     console.error("Get Conversations Error:", error);
//     res.status(500).json({ message: "Error fetching conversations" });
//   }
// };

// // 4. Get Direct Messages with Specific User
// export const getDirectMessages = async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     const { otherUserId } = req.params;

//     if (!userId) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     // Get all messages between two users (from shared projects)
//     const messages = await prisma.message.findMany({
//       where: {
//         project: {
//           OR: [
//             { AND: [{ freelancerId: Number(userId) }, { clientId: Number(otherUserId) }] },
//             { AND: [{ freelancerId: Number(otherUserId) }, { clientId: Number(userId) }] },
//           ]
//         },
//         OR: [
//           { senderId: Number(userId) },
//           { senderId: Number(otherUserId) }
//         ]
//       },
//       include: {
//         sender: { select: { id: true, name: true, role: true } }
//       },
//       orderBy: { createdAt: "asc" }
//     });

//     res.json(messages);
//   } catch (error) {
//     console.error("Get Direct Messages Error:", error);
//     res.status(500).json({ message: "Error fetching messages" });
//   }
// };