import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "@prisma/client";
import { sendInviteEmail, sendExistingUserNotification } from "../services/emailService.ts";

const prisma = new PrismaClient();

export const getInviteByToken = async (req, res) => {
  try {
    const { token } = req.params;

    const invite = await prisma.clientInvite.findUnique({
      where: { token },
      select: {
        name: true,
        email: true,
        status: true,
      },
    });

    if (!invite || invite.status !== "PENDING") {
      return res.status(404).json({ message: "Invalid or expired invite" });
    }

    return res.status(200).json({
      message: "Invite fetched successfully",
      invite,
    });
    
  } catch (error) {
    console.error("Get Invite Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const inviteclient = async (req, res) => {

  try {
    const { name, email } = req.body;
    const freelancerId = req.user?.id;

    if (!freelancerId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const freelancer = await prisma.user.findUnique({ where: { id: freelancerId } });
    const freelancerName = freelancer?.name || "A Freelancer";

    // Check if the email belongs to an existing user
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      const alreadyLinked = await prisma.clientInvite.findFirst({
        where: { email, freelancerId }
      });

      if (!alreadyLinked) {
        await prisma.clientInvite.create({
          data: {
            name,
            email,
            token: "ALREADY_REGISTERED_" + uuidv4(), // Dummy token
            freelancerId,
            status: "ACCEPTED",
          },
        });
      }

      await sendExistingUserNotification(email, freelancerName);

      res.status(200).json({ message: "User already exists. They have been added to your client list." });
      return;
    }

    // 1. Check for existing pending invite
    const pendingInvite = await prisma.clientInvite.findFirst({
        where: { email, status: "PENDING" } 
    });
    
    if (pendingInvite) {
        res.status(400).json({ message: "Invite already pending for this email." });
        return;
    }

    const token = uuidv4();

    await prisma.clientInvite.create({
      data: {
        name,
        email,
        token,
        freelancerId,
        status: "PENDING",
      },
    });

    // 4. Send Register Email
    const inviteLink = `http://localhost:3000/register?token=${token}`;
    await sendInviteEmail(email, inviteLink, freelancerName);

    res.status(201).json({ message: "Invitation sent successfully" });

  } catch (error) {
    console.error("Invite Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};