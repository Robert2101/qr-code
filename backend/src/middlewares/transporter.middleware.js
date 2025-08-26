import jwt from "jsonwebtoken";
import Transporter from "../models/transporter.model.js";

const transporterMiddleware = async (req, res, next) => {
    console.log("\n--- 🚚 Transporter Middleware Triggered ---");
    try {
        const token = req.cookies.jwt;
        console.log("🔍 [Middleware] Checking for 'jwt' cookie...");

        if (!token) {
            console.log("❌ [Middleware] No token found in cookies. Access denied.");
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        console.log("✅ [Middleware] Token found.");

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("🔑 [Middleware] Token decoded successfully. Payload:", decoded);

        if (!decoded || !decoded.id) {
            console.log("❌ [Middleware] Token is invalid (payload missing 'id'). Access denied.");
            return res.status(401).json({ message: "Unauthorized: Invalid token payload" });
        }

        console.log(`👤 [Middleware] Finding transporter with ID: ${decoded.id}`);
        const transporter = await Transporter.findById(decoded.id).select("-password");

        if (!transporter) {
            console.log("❌ [Middleware] Transporter not found in database. Access denied.");
            return res.status(404).json({ message: "Transporter not found" });
        }

        console.log("✅ [Middleware] Transporter authenticated:", transporter.email);

        // This is the crucial step. We attach the found transporter to the request object.
        req.user = transporter;

        console.log("➡️ [Middleware] Attaching user to request and calling next().");
        next();

    } catch (error) {
        console.error("💥 [Middleware] An error occurred:", error.message);

        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Unauthorized: Token is invalid or has expired." });
        }

        res.status(500).json({ message: "Internal Server Error" });
    }
};

export default transporterMiddleware;
