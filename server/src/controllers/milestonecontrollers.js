import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

        const progress = await calculateMilestoneProgress(Number(projectId));

        res.status(200).json({
            message: "Milestone Added Successfully",
            newMilestone: newMilestone,
            projectProgress: progress,
        })
        
    } catch (error) {
        console.error("New milestone error:", error);
        res.status(500).json({
            message: "Adding Milestone Failed",
            error: error.message,
        })
    }

}

export const updateMilestone = async (req, res) => {

    const { milestoneId} = req.params;
    const { title, price, status, dueDate } = req.body;
    
    try {

        const updatedMilestone = await prisma.milestone.update({
            where: { id: Number(milestoneId) },
            data: {
                title,
                price: price.toString(),
                status,
                dueDate: new Date(dueDate),
            }
        });

        const progress = await calculateMilestoneProgress(Number(updatedMilestone.projectId));

        res.status(200).json({
            message: "Milestone updated successfully",
            milestone: updatedMilestone,
            projectProgress: progress,
        })

    } catch (error) {
        res.status(500).json({
            message: "Updating Milestone Failed",
            error: error.message,
        })
    }
}

export const deleteMilestone = async (req, res) => {

    const { milestoneId } = req.params;

    try {
        const deletedMilestone = await prisma.milestone.delete({
            where: { id: Number(milestoneId) },
        });

        const progress = await calculateMilestoneProgress(Number(deletedMilestone.projectId));

        res.status(200).json({
            message: "Milestone deleted successfully",
            projectProgress: progress,
        });
    } catch (error) {
        res.status(500).json({
            message: "Deleting Milestone Failed",
            error: error.message,
        });
    }
}

export const updateMilestoneStatus = async (req, res) => {
    try {
        const { projectId, milestoneId } = req.params;
        const { status } = req.body;

        // Validate status
        if (!["PENDING", "ACTIVE", "COMPLETED"].includes(status)) {
            return res.status(400).json({
                message: "Invalid status. Must be PENDING, ACTIVE, or COMPLETED.",
            });
        }

        const updatedMilestone = await prisma.milestone.update({
            where: { id: Number(milestoneId) },
            data: { status },
        });

        console.log(`Milestone ${milestoneId} status updated to ${status}`);

        const progress = await calculateMilestoneProgress(Number(projectId));

        res.status(200).json({
            message: "Milestone status updated successfully",
            milestone: updatedMilestone,
            projectProgress: progress,
        });
    } catch (error) {
        console.error("Update milestone error:", error);
        res.status(500).json({
            message: "Failed to update milestone status",
            error: error.message,
        });
    }
};

// Function to calculate and update milestone progress
const calculateMilestoneProgress = async (projectId) => {
    try {
        const allmilestones = await prisma.milestone.count({
            where: { projectId: Number(projectId) },
        });

        //console.log(`Total milestones for project ${projectId}: ${allmilestones}`);

        const completedMilestones = await prisma.milestone.count({
            where: { projectId: Number(projectId), status: "COMPLETED" },
        });

        //console.log(`Completed milestones for project ${projectId}: ${completedMilestones}`);

        const progress = allmilestones === 0 ? 0 : Math.floor((completedMilestones / allmilestones) * 100);
        const status = allmilestones > 0 && completedMilestones === allmilestones ? "COMPLETED" : "ACTIVE";

        await prisma.project.update({
            where: { id: Number(projectId) },
            data: { progress, status },
        });
        
        //console.log(`Project ${projectId} progress: ${progress}%`);
        return progress;
    } catch (error) {
        console.error("Progress calculation error:", error);
        throw error;
    }
};

// Call this when creating new milestones
const updateProjectProgress = async (projectId) => {
    return await calculateMilestoneProgress(projectId);
};