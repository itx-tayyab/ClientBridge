import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export const getallclients = async (req, res) => {

    const freelancerId = req.user?.id;

    //console.log("Freelancer ID:", freelancerId);

    try {

        const allclients = await prisma.clientInvite.findMany({
            where: {
                freelancerId: Number(freelancerId),
                status: "ACCEPTED",
            },
        });

        const clientEmails = allclients.map(invite => invite.email);

        //console.log("Client Emails:", clientEmails);

        const clientsdata = await prisma.user.findMany({
            where: {
                email: {in: clientEmails},
                role: "CLIENT",
            },
            select: {
                id: true,
                name: true,
                email: true,        
            }

        })

        res.status(200).json({
            message: "Clients Fetched Successfully",
            clients: clientsdata,
        })

    } catch (error) {
        res.status(500).json({
            message: "Client Fetching Failed",
        })
    }
}


export const createproject = async (req, res) => {

    const { name, description, deadline, budget, clientId } = req.body;

    const freelancerId = req.user?.id;

    // console.log("--------------------------------");
    // console.log("Creating Project...");
    // console.log("Freelancer ID:", freelancerId);
    // console.log("Client ID received:", clientId);
    // console.log("Type of Client ID:", typeof clientId);
    // console.log("--------------------------------");

    if (!freelancerId) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    try {

        const validInvite = await prisma.clientInvite.findFirst({
            where: {
                freelancerId: Number(freelancerId),
                status: "ACCEPTED",
            }
        });

        // Get the client user
        const client = await prisma.user.findUnique({
            where: { id: Number(clientId) }
        });

        //console.log(client);

        if (!client) {
            return res.status(404).json({
                message: "Client not found",
            });
        }

        // Verify that this client was invited by this freelancer
        const inviteForThisClient = await prisma.clientInvite.findFirst({
            where: {
                freelancerId: Number(freelancerId),
                email: client.email,
                status: "ACCEPTED",
            }
        });

        if (!inviteForThisClient) {
            return res.status(403).json({
                message: "You can only create projects with clients you have invited and who have accepted your invitation.",
            });
        }

        const newproject = await prisma.project.create({
            data: {
                name,
                description,
                deadline,
                budget,
                freelancerId: Number(freelancerId),
                clientId: Number(clientId),
                status: "ACTIVE",
                progress: 0,
            }
        });

        await prisma.notification.create({
            data: {
                title: "New Project Assigned",
                message: `You have been added to a new project: ${name}`,
                userId: Number(clientId),
                isRead: false,
            }
        })

        res.status(200).json({
            message: "Project Created Successfully",
            project: newproject,
        })

    } catch (error) {
        console.error("Project creation error:", error);
        res.status(500).json({
            message: "Project Creation Failed",
            error: error.message,
        })
    }
}

export const getallprojects = async (req, res) => {

    const userId = req.user?.id;
    const queryClientId = req.query?.clientId;
    const parsedClientId = queryClientId ? Number(queryClientId) : null;

    if (queryClientId && Number.isNaN(parsedClientId)) {
        return res.status(400).json({
            message: "Invalid clientId",
        });
    }

    const user = await prisma.user.findUnique({
        where: { id: userId }
    });
    const role = user.role;

    // console.log("User ID:", userId);
    // console.log("User Role:", role);

    if (!userId || (role !== "FREELANCER" && role !== "CLIENT")) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    try {

        let projects;

        if (role === "FREELANCER") {
            const whereClause = {
                freelancerId: Number(userId),
                ...(parsedClientId ? { clientId: parsedClientId } : {}),
            };

            projects = await prisma.project.findMany(
                {
                    where: whereClause,
                    include: {
                        client: { select: { name: true} }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            );
        }
        else {
            projects = await prisma.project.findMany(
                {
                    where: { clientId: Number(userId) },
                    include: {
                        freelancer: { select: { name: true} }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            );
        }

        res.status(200).json({
            message: "Projects Fetched Successfully",
            projects: projects,
        });

    } catch (error) {
        res.status(500).json({
            message: "Project Fetching Failed",
        })
    }
}

export const getprojectdetails = async (req, res) => {

    const { projectId } = req.params;

    try {

        const project = await prisma.project.findUnique({
            where: { id: Number(projectId) },
            include: {
                client: {select: {name: true, email:true}},
                freelancer: { select: { name: true, email: true } },
                milestones: { orderBy: { id: "asc" } },
                files: { orderBy: { createdAt: "desc" } }
            }
        });

        if(!project){
            return res.status(404).json({
                message: "Project not found",
            });
        }

        //console.log(`Returning project ${projectId} with ${project.files?.length || 0} files`);

        res.status(200).json({
            message: "Project Details Fetched Successfully",
            project: project,
        })
        
    } catch (error) {
        res.status(500).json({
            message: "Project Details Fetching Failed",
        });
    }
}

export const newMilestone = async (req, res) => {

    try {

        const {projectId} = req.params;
        const {title, price, status, dueDate} = req.body;

        const newMilestone = await prisma.milestone.create({
            data: {
                title,
                price: price.toString(),
                status,
                dueDate: new Date(dueDate),
                projectId: Number(projectId),
            }
        });

        res.status(200).json({
            message: "Milestone Added Successfully",
            newMilestone: newMilestone,
        })
        
    } catch (error) {
        res.status(500).json({
            message: "Adding Milestone Failed",
        })
    }

}