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

export const updateproject = async (req, res) => {

    const { projectId } = req.params;
    const { name, description, deadline, budget, clientId } = req.body;
    const freelancerId = req.user?.id;

    if (!freelancerId) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    try {
        const existingProject = await prisma.project.findUnique({
            where: { id: Number(projectId) },
            include: {
                client: { select: { email: true } },
            },
        });

        if (!existingProject) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        if (existingProject.freelancerId !== Number(freelancerId)) {
            return res.status(403).json({
                message: "You are not allowed to update this project",
            });
        }

        let nextClientId = existingProject.clientId;

        if (clientId && Number(clientId) !== existingProject.clientId) {
            const client = await prisma.user.findUnique({
                where: { id: Number(clientId) }
            });

            if (!client) {
                return res.status(404).json({
                    message: "Client not found",
                });
            }

            const inviteForThisClient = await prisma.clientInvite.findFirst({
                where: {
                    freelancerId: Number(freelancerId),
                    email: client.email,
                    status: "ACCEPTED",
                }
            });

            if (!inviteForThisClient) {
                return res.status(403).json({
                    message: "You can only assign projects to clients you invited and who accepted.",
                });
            }

            nextClientId = Number(clientId);
        }

        const updatedProject = await prisma.project.update({
            where: { id: Number(projectId) },
            data: {
                name,
                description,
                deadline,
                budget,
                clientId: nextClientId,
            },
        });

        return res.status(200).json({
            message: "Project updated successfully",
            project: updatedProject,
        });

    } catch (error) {
        console.error("Project update error:", error);
        return res.status(500).json({
            message: "Project update failed",
            error: error.message,
        });
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

export const deleteproject = async (req, res) => {

    const { projectId } = req.params;
    const parsedProjectId = Number(projectId);
    const freelancerId = req.user?.id;

    if (!freelancerId) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    if (!projectId || Number.isNaN(parsedProjectId)) {
        return res.status(400).json({
            message: "Invalid projectId",
        });
    }

    try {

        const existingProject = await prisma.project.findUnique({
            where: { id: parsedProjectId },
        });

        if (!existingProject) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        if (existingProject.freelancerId !== Number(freelancerId)) {
            return res.status(403).json({
                message: "You are not allowed to delete this project",
            });
        }

        const deletedProject = await prisma.$transaction(async (tx) => {
            await tx.message.deleteMany({
                where: { projectId: parsedProjectId },
            });

            await tx.file.deleteMany({
                where: { projectId: parsedProjectId },
            });

            await tx.milestone.deleteMany({
                where: { projectId: parsedProjectId },
            });

            return tx.project.delete({
                where: { id: parsedProjectId },
            });
        });

        res.status(200).json({
            message: "Project Deleted Successfully",
            project: deletedProject,
        });

    } catch (error) {
        console.error("Project deletion error:", error);
        res.status(500).json({
            message: "Project Deletion Failed",
            error: error.message,
        });
    }

}