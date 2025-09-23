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
        const { name, email, mobile, password, vehicleModel, licensePlate } = req.body;

        // 1. Validate inputs
        if (!name || !mobile || !password || !licensePlate) {
            return res.status(400).json({ message: "Name, mobile, password, and license plate are required" });
        }

        // 2. Check duplicate mobile
        const existingTransporterByMobile = await Transporter.findOne({ mobile });
        if (existingTransporterByMobile) {
            return res.status(400).json({ message: "Mobile number already registered" });
        }

        // 3. Check duplicate email if provided
        if (email) {
            const existingTransporterByEmail = await Transporter.findOne({ email });
            if (existingTransporterByEmail) {
                return res.status(400).json({ message: "Email already registered" });
            }
        }

        // 4. Check duplicate license plate
        const existingLicense = await Transporter.findOne({ "vehicleInfo.licensePlate": licensePlate });
        if (existingLicense) {
            return res.status(400).json({ message: "License plate already registered" });
        }

        // 5. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 6. Create transporter (without qrCode yet)
        const newTransporter = await Transporter.create({
            name,
            email, // Optional
            mobile, // Required
            password: hashedPassword,
            vehicleInfo: {
                model: vehicleModel || "",
                licensePlate
            }
        });

        // 7. Generate QR code (contains transporter ID)
        const qrDataUrl = await QRCode.toDataURL(newTransporter._id.toString());

        // 8. Upload QR to cloudinary
        const uploadResult = await cloudinary.uploader.upload(qrDataUrl, {
            folder: "qr_codes",
            public_id: `transporter_qr_${newTransporter._id}`,
            overwrite: true
        });

        // 9. Save QR code URL in DB
        newTransporter.qrCodeUrl = uploadResult.secure_url;
        await newTransporter.save();

        // 10. Generate token for authentication
        generateToken(newTransporter._id, res);

        // 11. Response
        const { password: pwd, ...transporterData } = newTransporter.toObject();
        res.status(201).json({
            message: "Transporter registered successfully",
            transporter: transporterData
        });

    } catch (error) {
        console.error("Transporter Registration error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { loginId, password } = req.body;

        // 1. Validate input
        if (!loginId || !password) {
            return res.status(400).json({ message: "Login ID and password are required" });
        }

        // 2. Find transporter by email or mobile
        const transporter = await Transporter.findOne({
            $or: [{ email: loginId }, { mobile: loginId }]
        });
        if (!transporter) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // 3. Compare password
        const isMatch = await bcrypt.compare(password, transporter.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // 4. Generate JWT token
        generateToken(transporter._id, res);

        // 5. Respond with transporter info
        const { password: pwd, ...transporterData } = transporter.toObject();
        res.status(200).json({
            message: "Login successful",
            transporter: transporterData
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
            transporter
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

        // Check for uniqueness if email/mobile are updated
        if (email) {
            const existing = await Transporter.findOne({ email, _id: { $ne: transporterId } });
            if (existing) return res.status(409).json({ message: "Email is already in use." });
            transporter.email = email;
        }

        

        // Update vehicle info
        if (vehicleModel) transporter.vehicleInfo.model = vehicleModel;
        if (licensePlate) transporter.vehicleInfo.licensePlate = licensePlate;

        await transporter.save();

        const { password, ...transporterData } = transporter.toObject();
        res.status(200).json({
            message: "Profile updated successfully",
            transporter: transporterData
        });

    } catch (error) {
        console.error("Update transporter profile error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
const scan = async (req, res) => {
    try {
        const transporterId = req.user.id; // from protected route
        const { userId, weight, wasteTypes, coordinates } = req.body;

        if (!userId || !weight || !coordinates || coordinates.length !== 2) {
            return res.status(400).json({ message: "Required data missing or invalid" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

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

        await Transporter.findByIdAndUpdate(transporterId, {
            currentLocation: { type: "Point", coordinates }
        });

        const today = new Date();
        const dateKey = new Date(today.setHours(0, 0, 0, 0));

        let history = await TransporterHistory.findOne({ transporter: transporterId, date: dateKey });

        if (!history) {
            history = new TransporterHistory({
                transporter: transporterId,
                date: dateKey,
                checkpoints: []
            });
        }

        const checkpoint = {
            location: { type: "Point", coordinates },
            scannedAt: new Date()
        };
        history.checkpoints.push(checkpoint);

        await history.save();

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
        if (!transporter) {
            return res.status(404).json({ message: "Transporter not found" });
        }

        if (!transporter.qrCodeUrl) {
            try {
                const qrDataUrl = await QRCode.toDataURL(transporter._id.toString());

                const uploadResult = await cloudinary.uploader.upload(qrDataUrl, {
                    folder: "qr_codes",
                    public_id: `transporter_qr_${transporter._id}`,
                    overwrite: true
                });

                transporter.qrCodeUrl = uploadResult.secure_url;
                await transporter.save();
            } catch (qrError) {
                console.error('Error generating QR code on the fly:', qrError);
                return res.status(500).json({ message: "Could not generate QR code" });
            }
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