import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient() ;


export async function getprofile(req, res) {
    try {
        const id = req.user;
        const user = await prisma.user.findUnique({
            where: {id: id.id}
        })
        res.json({
            message: "Profile fetched successfully",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        })
    } catch (error) {
        res.status(405).json({
            message: "Cannot get the Profile",
        })  
    }
}
