import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const generateToken = (userId, res) => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });
    res.cookie("jwt", token, {
        httpOnly: true,
        secure: false, // Disable secure flag for local development
        sameSite: "Lax", // Use Lax for local development
        maxAge: 7 * 24 * 60 * 60 * 1000 
    });
    return token;
}

export { generateToken };