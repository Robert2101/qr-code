import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";

const adminMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.userId) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }

        const admin = await Admin.findById(decoded.userId).select("-password");
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        
        // Combines authentication and authorization in one step
        if (admin.role !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Admin access required" });
        }

        req.user = admin; // Attach the found admin to the request
        next();
    } catch (error) {
        console.error("Admin middleware error:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export default adminMiddleware;