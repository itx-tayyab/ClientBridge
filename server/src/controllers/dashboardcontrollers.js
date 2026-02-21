import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const freelancerdashboard = async (req, res) => {

    const freelancerId = req.user?.id;

    if (!freelancerId) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    try {

        const totalClients = await prisma.clientInvite.count({
            where: {
                freelancerId: Number(freelancerId),
                status: "ACCEPTED",
            }
        });

        const activeProjects = await prisma.project.count({
            where: {
                freelancerId: Number(freelancerId),
                status: "ACTIVE",
            }
        });

        const completedProjects = await prisma.project.count({
            where: {
                freelancerId: Number(freelancerId),
                status: "COMPLETED",
            }
        });

        const recentProjects = await prisma.project.findMany({
            where: {
                freelancerId: Number(freelancerId),
            },
            select: {
                name: true,
                status: true,
                deadline: true,
                client: {
                    select: {
                        name: true,
                    }
                }
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 5,
        });

        res.status(200).json({
            message: "Dashboard Fetched Successfully",
            stats: {
                totalClients: totalClients,
                activeProjects: activeProjects,
                completedProjects: completedProjects,
            },
            recentProjects: recentProjects,
        });

    } catch (error) {
        res.status(500).json({
            message: "Dashboard Fetching Failed",
        });
    }

}

export const clientdashboard = async (req, res) => {

    const clientId = req.user?.id;

    if (!clientId) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    try {

        const activeProjects = await prisma.project.count({
            where: {
                clientId: Number(clientId),
                status: "ACTIVE",
            }
        });

        const pendingProjects = await prisma.project.count({
            where: {
                clientId: Number(clientId),
                status: "PENDING",
            }
        });

        const recentProjects = await prisma.project.findMany({
            where: {
                clientId: Number(clientId),
            },
            select: {
                name: true,
                status: true,
                deadline: true,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 5,
        });

        res.status(200).json({
            message: "Dashboard Fetched Successfully",
            stats: {
                activeProjects: activeProjects,
                pendingProjects: pendingProjects,
            },
            recentProjects: recentProjects,
        });

    } catch (error) {
        res.status(500).json({
            message: "Dashboard Fetching Failed",
        });
    }
}
