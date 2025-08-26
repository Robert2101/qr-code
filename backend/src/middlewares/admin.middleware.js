import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";

const adminMiddleware = async (req, res, next) => {
    console.log("\n--- 🛡️ Admin Middleware Triggered ---");
    try {
        const token = req.cookies.jwt;
        console.log("🔍 [Middleware] Checking for 'jwt' cookie...");

        if (!token) {
            console.log("❌ [Middleware] No token found. Access denied.");
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        console.log("✅ [Middleware] Token found:", token.substring(0, 15) + "...");

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("🔑 [Middleware] Token decoded successfully. Payload:", decoded);

        // FIX: Check for 'decoded.id' to match the payload in your jwt.js file.
        if (!decoded || !decoded.id) {
            console.log("❌ [Middleware] Token is invalid (missing id). Access denied.");
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }

        console.log(`👤 [Middleware] Finding admin with ID: ${decoded.id}`);
        const admin = await Admin.findById(decoded.id).select("-password");

        if (!admin) {
            console.log("❌ [Middleware] Admin not found in database. Access denied.");
            return res.status(404).json({ message: "Admin not found" });
        }

        if (admin.role !== 'admin') {
            console.log(`🚫 [Middleware] User has role '${admin.role}', not 'admin'. Access forbidden.`);
            return res.status(403).json({ message: "Forbidden: Admin access required" });
        }

        console.log("✅ [Middleware] Admin authenticated successfully:", admin.email);
        req.user = admin; // Attach the found admin to the request
        next();

    } catch (error) {
        console.error("💥 [Middleware] Error:", error.message);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

export default adminMiddleware;
