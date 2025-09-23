import bcrypt from "bcryptjs";
import QRCode from "qrcode";
import cloudinary from "../config/cloudinary.js";
import User from "../models/user.model.js";
import { generateToken } from "../utils/jwt.js";
import Collection from "../models/collection.model.js";
import otpGenerator from 'otp-generator';
import { sendVerificationSms } from '../utils/sms.js';

const login = async (req, res) => {
    try {
        const { loginId, password } = req.body; // loginId can be email or mobile
        console.log("📥 Login request received:", { loginId });

        if (!loginId || !password) {
            console.warn("⚠️ Missing login identifier or password");
            return res.status(400).json({ message: "Please enter your email/mobile and password" });
        }

        // Find user by either email or mobile number
        const user = await User.findOne({
            $or: [{ email: loginId }, { mobile: loginId }],
        });
        console.log("🔍 User lookup result:", user ? user._id : "Not found");

        if (!user) {
            console.warn("❌ Login failed: User not found for:", loginId);
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("🔑 Password match:", isMatch);

        if (!isMatch) {
            console.warn("❌ Login failed: Password mismatch for user:", user._id);
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate token
        generateToken(user._id, res);
        console.log("✅ Token generated for user:", user._id);

        const { password: pwd, ...userData } = user.toObject();
        console.log("✅ Login successful. User data:", userData);

        res.status(200).json({
            message: "Login successful",
            user: userData
        });

    } catch (error) {
        console.error("💥 Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


const register = async (req, res) => {
    try {
        const { name, email, mobile, password, street, city, state, pinCode } = req.body;

        if (!name || !mobile || !password) {
            return res.status(400).json({ message: "Name, mobile, and password are required" });
        }

        let user = await User.findOne({ mobile });

        // If user exists and is already verified, block registration
        if (user && user.isVerified) {
            return res.status(400).json({ message: "This mobile number is already registered and verified." });
        }

        // Generate a 6-digit numeric OTP
        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false,
        });

        // Set OTP expiry to 10 minutes from now
        const otpExpires = Date.now() + 10 * 60 * 1000;
        const hashedOtp = await bcrypt.hash(otp, 10);
        const hashedPassword = await bcrypt.hash(password, 10);

        // If user exists (but is not verified), update them. Otherwise, create a new one.
        if (user) {
            user.name = name;
            user.email = email;
            user.password = hashedPassword;
            user.address = { street, city, state, pinCode };
            user.otp = hashedOtp;
            user.otpExpires = otpExpires;
            await user.save();
        } else {
            user = await User.create({
                name,
                email,
                mobile,
                password: hashedPassword,
                address: { street, city, state, pinCode },
                otp: hashedOtp,
                otpExpires: otpExpires,
            });
        }

        // Send the SMS
        await sendVerificationSms(mobile, otp);

        res.status(201).json({
            message: `Registration successful! An OTP has been sent to ${mobile}.`,
            // Send mobile number back to the frontend to use on the verification screen
            data: { mobile: user.mobile }
        });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { mobile, otp } = req.body;

        const user = await User.findOne({
            mobile,
            otpExpires: { $gt: Date.now() } // Check that OTP is not expired
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid OTP, user not found, or OTP has expired." });
        }

        const isMatch = await bcrypt.compare(otp, user.otp);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid OTP." });
        }

        // --- Verification Success ---
        user.isVerified = true;
        user.otp = undefined;       // Clear OTP fields for security
        user.otpExpires = undefined;

        // Generate and upload QR code now that user is fully verified
        const qrDataUrl = await QRCode.toDataURL(user._id.toString());
        const uploadResult = await cloudinary.uploader.upload(qrDataUrl, {
            folder: "qr_codes",
            public_id: `qr_${user._id}`,
            overwrite: true
        });
        user.qrCodeUrl = uploadResult.secure_url;

        await user.save();

        // Generate JWT token and log them in
        generateToken(user._id, res);

        const { password: pwd, ...userResponse } = user.toObject();

        res.status(200).json({
            message: "Account verified successfully!",
            user: userResponse
        });

    } catch (error) {
        console.error("OTP Verification error:", error);
        res.status(500).json({ message: "Server error" });
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

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const { name, street, city, state, pinCode } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (street || city || state || pinCode) {
            updateData.address = {};
            if (street) updateData.address.street = street;
            if (city) updateData.address.city = city;
            if (state) updateData.address.state = state;
            if (pinCode) updateData.address.pinCode = pinCode;
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password"); // remove password from response

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: "Server error while updating profile" });
    }
};

const checkUser = async (req, res) => {
    try {
        const userId = req.user.id; // set in protectedRoute after JWT verification

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User authenticated",
            user
        });
    } catch (error) {
        console.error("Check User Error:", error);
        res.status(500).json({ message: "Server error while checking user" });
    }
};

const getQR = async (req, res) => {
    try {
        const userId = req.user.id; // From protectedRoute after JWT verification

        const user = await User.findById(userId).select("qrCodeUrl");

        if (!user || !user.qrCodeUrl) {
            return res.status(404).json({ message: "QR code not found" });
        }

        res.status(200).json({
            message: "QR code retrieved successfully",
            qrCodeUrl: user.qrCodeUrl
        });
    } catch (error) {
        console.error("Get QR Error:", error);
        res.status(500).json({ message: "Server error while retrieving QR code" });
    }
};

const getCollections = async (req, res) => {
    try {
        const userId = req.user.id; // From JWT after protectedRoute

        // Fetch collections for the logged-in user
        const collections = await Collection.find({ user: userId })
            .populate("transporter", "name email") // Include transporter name & email
            .sort({ createdAt: -1 }); // Newest first

        if (!collections.length) {
            return res.status(404).json({ message: "No collection history found" });
        }

        res.status(200).json({
            message: "Collection history retrieved successfully",
            count: collections.length,
            collections
        });
    } catch (error) {
        console.error("Get Collections Error:", error);
        res.status(500).json({ message: "Server error while retrieving collections" });
    }
};

const getWallet = async (req, res) => {
    try {
        const userId = req.user.id; // From JWT after protectedRoute

        const user = await User.findById(userId).select("walletBalance");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Wallet balance retrieved successfully",
            walletBalance: user.walletBalance
        });
    } catch (error) {
        console.error("Get Wallet Error:", error);
        res.status(500).json({ message: "Server error while retrieving wallet balance" });
    }
};

export { login, register, logout, updateProfile, checkUser, getQR, getCollections, getWallet, verifyOtp };