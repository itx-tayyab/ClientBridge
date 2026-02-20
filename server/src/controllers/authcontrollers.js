import bcrypt from 'bcryptjs';
import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import cookies from 'cookie-parser';


const prisma = new PrismaClient();


export const registerUser = async (req,res) => {
  const { name, email, password, role, token } = req.body;

  try{

    const existingUser = await prisma.user.findUnique({
      where:{ email }
    });

    if(existingUser){
      return res.status(400).json({
        message:"User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password,10);

    if(token){

      const invite = await prisma.clientInvite.findUnique({
        where:{ token }
      });

      if(!invite || invite.status !== "PENDING"){
        return res.status(400).json({
          message:"Invalid or expired invite"
        });
      }

      if (invite.email.toLowerCase() !== email.toLowerCase()) {
        return res.status(400).json({
          message: "Email must match the invited email address",
        });
      }

      const newUser = await prisma.user.create({
        data:{
          name,
          email,
          password: hashedPassword,
          role:"CLIENT"
        }
      });

      await prisma.clientInvite.update({
        where:{ id:invite.id },
        data:{ status:"ACCEPTED" }
      });

      return res.status(201).json({
        message:"Client account created",
        user:newUser
      });
    }

    const newUser = await prisma.user.create({
      data:{
        name,
        email,
        password: hashedPassword,
        role
      }
    });

    return res.status(201).json({
      message:"User registered successfully",
      user:newUser
    });

  }catch(error){
    console.error(error);
    res.status(500).json({
      message:"Server error"
    });
  }
};


export const loginUser = async (req,res) => {
    const {email, password} = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: {email},
        });

        if(!user)
        {
            res.status(400).json({
                message: "Invalid Credentials",
            })
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch)
        {
            res.status(400).json({
                message: "Invalid Password",
            })
        }

        const token = jwt.sign
        (
            {id: user.id},
            process.env.JWT_SECRET,
            {expiresIn: '1d'}
        )

        const refreshtoken = jwt.sign
        (
            {id: user.id},
            process.env.JWT_REFRESH_SECRET,
            {expiresIn: '1d'}
        )

        res.cookie("refreshToken", refreshtoken, {
            httpOnly: true,
            secure: true,
        })

        res.status(200).json({
            message: "Login Successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        })
        
    } catch (error) {
        res.status(500).json({
            message: "Server Error"
        });
    }
}

