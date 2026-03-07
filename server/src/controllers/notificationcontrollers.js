import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getnotifications = async (req, res) => {

    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    try {

        const notifications = await prisma.notification.findMany({
            where: { userId: Number(userId) },
            orderBy: { createdAt: 'desc' },
            take: 20,
        })
        
        res.status(200).json({
            message: "Notifications Fetched Successfully",
            notifications: notifications,
        })

    } catch (error) {
        res.status(500).json({
            message: "Failed to Fetch Notifications",
            error: error.message,
        })
    }
}

export const markAllRead = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) return;

    await prisma.notification.updateMany({
      where: { userId: Number(userId), isRead: false },
      data: { isRead: true }
    });

    res.json({ message: "All marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Error updating notifications" });
  }
};
