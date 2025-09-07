import Transporter from '../models/transporter.model.js'
import bcrypt from "bcryptjs";
import QRCode from "qrcode";
import cloudinary from "../config/cloudinary.js";
import { generateToken } from "../utils/jwt.js";
import Collection from '../models/collection.model.js';
import TransporterHistory from '../models/transporterhistory.model.js';
import User from '../models/user.model.js';

const register = async (req, res) => {
    try {
        const { name, email, password, vehicleModel, licensePlate } = req.body;

        // 1. Validate inputs
        if (!name || !email || !password || !licensePlate) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        // 2. Check duplicate email
        const existingTransporter = await Transporter.findOne({ email });
        if (existingTransporter) {
            return res.status(400).json({ message: "Transporter already exists" });
        }

        // 3. Check duplicate license plate
        const existingLicense = await Transporter.findOne({ "vehicleInfo.licensePlate": licensePlate });
        if (existingLicense) {
            return res.status(400).json({ message: "License plate already registered" });
        }

        // 4. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Create transporter (without qrCode yet)
        const newTransporter = await Transporter.create({
            name,
            email,
            password: hashedPassword,
            vehicleInfo: {
                model: vehicleModel || "",
                licensePlate
            }
        });

        // 6. Generate QR code (contains transporter ID)
        const qrDataUrl = await QRCode.toDataURL(newTransporter._id.toString());

        // 7. Upload QR to cloudinary
        const uploadResult = await cloudinary.uploader.upload(qrDataUrl, {
            folder: "qr_codes",
            public_id: `transporter_qr_${newTransporter._id}`,
            overwrite: true
        });

        // 8. Save QR code URL in DB
        newTransporter.qrCodeUrl = uploadResult.secure_url;
        await newTransporter.save();

        // 9. Generate token for authentication
        generateToken(newTransporter._id, res);

        // 10. Response
        res.status(201).json({
            message: "Transporter registered successfully",
            transporter: {
                id: newTransporter._id,
                name: newTransporter.name,
                email: newTransporter.email,
                role: newTransporter.role,
                vehicleInfo: newTransporter.vehicleInfo,
                qrCodeUrl: newTransporter.qrCodeUrl
            }
        });

    } catch (error) {
        console.error("Transporter Registration error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // 2. Find transporter by email
        const transporter = await Transporter.findOne({ email });
        if (!transporter) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // 3. Compare password
        const isMatch = await bcrypt.compare(password, transporter.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // 4. Generate JWT token
        generateToken(transporter._id, res); // sets cookie or returns token in response

        // 5. Respond with transporter info
        res.status(200).json({
            message: "Login successful",
            transporter: {
                id: transporter._id,
                name: transporter.name,
                email: transporter.email,
                role: transporter.role,
                vehicleInfo: transporter.vehicleInfo,
                qrCodeUrl: transporter.qrCodeUrl,
                walletBalance: transporter.walletBalance
            }
        });

    } catch (error) {
        console.error("Transporter login error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logout successful" });
    } catch (err) {
        console.error("error in logout:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
const checkUser = async (req, res) => {
    try {
        // req.user is set by protectedRoute middleware after verifying JWT
        const transporterId = req.user.id;

        // Fetch transporter details from DB
        const transporter = await Transporter.findById(transporterId).select(
            "-password" // exclude password
        );

        if (!transporter) {
            return res.status(404).json({ message: "Transporter not found" });
        }

        // Return transporter info
        res.status(200).json({
            message: "Transporter verified",
            transporter: {
                id: transporter._id,
                name: transporter.name,
                email: transporter.email,
                role: transporter.role,
                vehicleInfo: transporter.vehicleInfo,
                qrCodeUrl: transporter.qrCodeUrl,
                walletBalance: transporter.walletBalance,
                currentLocation: transporter.currentLocation
            }
        });

    } catch (error) {
        console.error("Check transporter error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const transporterId = req.user.id; // set by protectedRoute middleware
        const { name, email, vehicleModel, licensePlate } = req.body;

        // Find transporter
        const transporter = await Transporter.findById(transporterId);
        if (!transporter) {
            return res.status(404).json({ message: "Transporter not found" });
        }

        // Update basic fields if provided
        if (name) transporter.name = name;
        if (email) transporter.email = email;

        // Update vehicle info
        if (vehicleModel) transporter.vehicleInfo.model = vehicleModel;
        if (licensePlate) transporter.vehicleInfo.licensePlate = licensePlate;

        // Optional: regenerate QR code if ID or vehicle info changes
        if (req.body.regenerateQR) {
            const qrDataUrl = await QRCode.toDataURL(transporter._id.toString());
            const uploadResult = await cloudinary.uploader.upload(qrDataUrl, {
                folder: "qr_codes",
                public_id: `transporter_qr_${transporter._id}`,
                overwrite: true
            });
            transporter.qrCodeUrl = uploadResult.secure_url;
        }

        await transporter.save();

        res.status(200).json({
            message: "Profile updated successfully",
            transporter: {
                id: transporter._id,
                name: transporter.name,
                email: transporter.email,
                role: transporter.role,
                vehicleInfo: transporter.vehicleInfo,
                qrCodeUrl: transporter.qrCodeUrl,
                walletBalance: transporter.walletBalance,
                currentLocation: transporter.currentLocation
            }
        });

    } catch (error) {
        console.error("Update transporter profile error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
const scan = async (req, res) => {
    try {
        console.log("🔍 Incoming scan request...");
        console.log("➡️ Transporter ID (from token):", req.user?.id);
        console.log("➡️ Request body:", req.body);

        const transporterId = req.user.id; // from protected route
        const { userId, weight, wasteTypes, coordinates } = req.body;

        // Validate required fields
        if (!userId || !weight || !coordinates || coordinates.length !== 2) {
            console.warn("⚠️ Validation failed:", { userId, weight, coordinates });
            return res.status(400).json({ message: "Required data missing or invalid" });
        }

        // Verify user exists
        console.log("🔎 Checking if user exists:", userId);
        const user = await User.findById(userId);
        if (!user) {
            console.warn("❌ User not found:", userId);
            return res.status(404).json({ message: "User not found" });
        }

        // Create Collection record
        console.log("📦 Creating collection record...");
        const collection = await Collection.create({
            user: userId,
            transporter: transporterId,
            weight,
            wasteTypes: wasteTypes || { wet: 0, dry: 0, hazardous: 0 },
            location: {
                type: "Point",
                coordinates
            }
        });
        console.log("✅ Collection created:", collection._id);

        // Update transporter’s current location
        console.log("🛠 Updating transporter location...");
        await Transporter.findByIdAndUpdate(transporterId, {
            currentLocation: { type: "Point", coordinates }
        });
        console.log("✅ Transporter location updated");

        // Prepare date key for today
        const today = new Date();
        const dateKey = new Date(today.setHours(0, 0, 0, 0)); // midnight timestamp
        console.log("📅 Date key:", dateKey);

        // Find or create today’s transporter history
        console.log("🔎 Fetching transporter history for today...");
        let history = await TransporterHistory.findOne({ transporter: transporterId, date: dateKey });

        if (!history) {
            console.log("ℹ️ No history found for today, creating new...");
            history = new TransporterHistory({
                transporter: transporterId,
                date: dateKey,
                checkpoints: []
            });
        } else {
            console.log("✅ History found:", history._id);
        }

        // Add new checkpoint
        const checkpoint = {
            location: { type: "Point", coordinates },
            scannedAt: new Date()
        };
        console.log("📍 Adding checkpoint:", checkpoint);
        history.checkpoints.push(checkpoint);

        await history.save();
        console.log("✅ History saved with new checkpoint");

        // Respond with created records
        console.log("🎉 Scan successful");
        res.status(201).json({
            message: "Scan successful",
            collection,
            checkpoint
        });

    } catch (error) {
        console.error("💥 Scan error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const showQr = async (req, res) => {
    try {
        const transporterId = req.user.id;
        if (!transporterId) {
            return res.status(400).json({ message: "Transporter ID missing" });
        }

        const transporter = await Transporter.findById(transporterId);
<<<<<<< HEAD
        if (!transporter) {
            return res.status(404).json({ message: "Transporter not found" });
        }
        
        if (!transporter.qrCodeUrl) {
            // If QR code is missing, generate it on the fly
            try {
                console.log('QR code missing for transporter, generating now:', transporterId);
                const qrDataUrl = await QRCode.toDataURL(transporter._id.toString());
                
                const uploadResult = await cloudinary.uploader.upload(qrDataUrl, {
                    folder: "qr_codes",
                    public_id: `transporter_qr_${transporter._id}`,
                    overwrite: true
                });
                
                transporter.qrCodeUrl = uploadResult.secure_url;
                await transporter.save();
                console.log('Generated and saved new QR code:', uploadResult.secure_url);
            } catch (qrError) {
                console.error('Error generating QR code on the fly:', qrError);
                return res.status(404).json({ message: "Could not generate QR code" });
            }
=======
        if (!transporter || !transporter.qrCodeUrl) {
            return res.status(404).json({ message: "QR code not found" });
>>>>>>> c81b36c7c0fb29733e30c3d4a9ebe4328a1c4683
        }

        res.status(200).json({
            message: "QR code retrieved",
            qrCodeUrl: transporter.qrCodeUrl
        });

    } catch (error) {
        console.error("Show QR code error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export {
    register,
    login,
    logout,
    checkUser,
    updateProfile,
    scan,
    showQr
};