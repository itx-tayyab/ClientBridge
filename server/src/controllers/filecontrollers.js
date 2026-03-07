import { PrismaClient } from "@prisma/client";  

const prisma = new PrismaClient();

export const uploadFile = async (req, res) => {

    try {

        const {projectId} = req.params;
        const userId = req.user?.id;

    if (!req.file) {
        return res.status(400).json({
            message: "No file uploaded",
        });
    }

    const user = await prisma.user.findUnique({
        where: { id: Number(userId) },
    });

    if (!user) {
        return res.status(404).json({
            message: "User not found",
        });
    }

    const fileUrl = req.file.path;

    const fileSize = req.file.size 
      ? `${(req.file.size / 1024 / 1024).toFixed(2)} MB` 
      : "Unknown Size";

    const newFile = await prisma.file.create({
        data: {
            name: req.file.originalname,
            url: fileUrl,
            size: fileSize,
            uploadedBy: user.name,
            projectId: Number(projectId),
        }
    }); 

    console.log("✅ File saved to database:", newFile);

    res.status(200).json({
        message: "File Uploaded Successfully",
        file: newFile,
    });

    } catch (error) {
        console.error("❌ File upload error:", error);
        res.status(500).json({
            message: "File Upload Failed",
            error: error.message,
        });
    }
}