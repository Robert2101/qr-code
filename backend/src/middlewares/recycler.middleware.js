import Recycler from "../models/recycler.model.js";
import jwt from "jsonwebtoken";

const recyclerMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.id) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }

        const recycler = await Recycler.findById(decoded.id).select("-password");
        if (!recycler) {
            return res.status(404).json({ message: "Recycler not found" });
        }

        req.user = recycler;
        next(); // Proceed to the next middleware or controller function

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Unauthorized: Invalid token signature" });
        }
        console.error("Recycler middleware error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export default recyclerMiddleware;