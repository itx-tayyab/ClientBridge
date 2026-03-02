import jwt from 'jsonwebtoken';

export const authenticate = (req,res,next) => {
     
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
            message: "Token Missing",
        })
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decode;
        next();
        
    } catch (error) {
        res.status(401).json({
            message: "Invalid Token",
        })
    }
}