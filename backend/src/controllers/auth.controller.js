import bcrypt from "bcryptjs";
import QRCode from "qrcode";
import cloudinary from "../config/cloudinary.js";
import User from "../models/user.model.js";
import { generateToken } from "../utils/jwt.js";
import Collection from "../models/collection.model.js";

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Please enter email and password" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        generateToken(user._id, res);

        const { password: pwd, ...userData } = user.toObject();
        res.status(200).json({
            message: "Login successful",
            user: userData
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const register = async (req, res) => {
    try {
        const { name, email, password, street, city, state, pinCode } = req.body;

        if (!name || !email || !password || !street || !city || !state || !pinCode) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            address: {
                street,
                city,
                state,
                pinCode
            }
        });

        const qrDataUrl = await QRCode.toDataURL(newUser._id.toString());

        const uploadResult = await cloudinary.uploader.upload(qrDataUrl, {
            folder: "qr_codes",
            public_id: `qr_${newUser._id}`,
            overwrite: true
        });

        newUser.qrCodeUrl = uploadResult.secure_url;
        await newUser.save();

        generateToken(newUser._id, res);

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                address: newUser.address,
                qrCodeUrl: newUser.qrCodeUrl
            }
        });

    } catch (error) {
        console.error("Registration error:", error);
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

export { login, register, logout, updateProfile, checkUser, getQR, getCollections, getWallet };