import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getclients = async (req, res) => {

    const freelancerId = req.user?.id;

    if (!freelancerId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {

        const invites = await prisma.clientInvite.findMany({
            where: {
                freelancerId: Number(freelancerId),
                status: {in: ["PENDING", "ACCEPTED"]}
            },
            select: {
                id: true,
                name: true,
                email: true,
                status: true,
            }
        });

        //console.log("Invites retrieved:", invites);

        const clientEmails = invites.map((invite) => invite.email);

        //console.log("Client emails extracted:", clientEmails);

        const users = await prisma.user.findMany({
            where: {
                email: { in: clientEmails },
                role: "CLIENT",
            },
            select: {
                id: true,
                email: true,
            }
        });

        //console.log("Users retrieved for client emails:", users);

        const userIdByEmail = new Map(users.map((user) => [user.email, user.id]));

        //console.log(userIdByEmail);

        const clients = invites.map((invite) => {
            const userId = userIdByEmail.get(invite.email) ?? null;
            return {
            
                id: invite.status === "PENDING" ? invite.id : userId,
                userId: userId, 
                inviteId: invite.id,
                name: invite.name,
                email: invite.email,
                status: invite.status,
            };
        });

        res.status(200).json({
            message: 'Clients retrieved successfully',
            clients: clients,
        });

        
    } catch (error) {
        console.error("Error retrieving clients:", error);
        res.status(500).json({ error: 'Failed to retrieve clients' });
    }
}