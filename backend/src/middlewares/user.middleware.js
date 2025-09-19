import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protectedRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No Token Provided" });
        }

        // Verify the token. If it fails, it will throw an error and go to the catch block.
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user based on the ID from the token.
        // This ensures the user still exists in the database.
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Attach the full user object to the request.
        req.user = user;

        next(); // Proceed to the next middleware or controller

    } catch (error) {
        // This block will now catch specific JWT errors and give clear messages
        if (error.name === 'JsonWebTokenError') {
            console.error("Error in protectRoute middleware: Invalid Token Signature. Check your JWT_SECRET.", error);
            return res.status(401).json({ message: "Unauthorized: Invalid Token" });
        }
        if (error.name === 'TokenExpiredError') {
            console.error("Error in protectRoute middleware: Token has expired.", error);
            return res.status(401).json({ message: "Unauthorized: Token Expired" });
        }

        // For any other errors
        console.error("Error in protectRoute middleware:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export default protectedRoute;

