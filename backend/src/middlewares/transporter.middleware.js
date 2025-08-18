import jwt from "jsonwebtoken";
import Transporter from "../models/transporter.model.js";

const transporterMiddleware = async (req, res, next) => {
    const token = req.cookies.jwt;
    try{
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token" });
        }

        // Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.id) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }

        // Find transporter by ID
        const transporter = await Transporter.findById(decoded.id);
        if (!transporter) {
            return res.status(404).json({ message: "Transporter not found" });
        }

        // Attach to request
        req.user = transporter;
        next();
    }catch (error) {
        console.error("Transporter middleware error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
    
    

};

export default transporterMiddleware;
