import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const generateToken = (userId, res) => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });
    res.cookie("jwt", token, {
        httpOnly: true,
<<<<<<< HEAD
        secure: false, // Disable secure flag for local development
        sameSite: "Lax", // Use Lax for local development
=======
        secure: process.env.NODE_ENV !== "production", // Use secure cookies in production
        sameSite: "None",
>>>>>>> c81b36c7c0fb29733e30c3d4a9ebe4328a1c4683
        maxAge: 7 * 24 * 60 * 60 * 1000 
    });
    return token;
}

export { generateToken };