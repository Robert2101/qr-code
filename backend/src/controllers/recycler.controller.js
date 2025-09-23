import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";
import Recycler from "../models/recycler.model.js";
import Collection from "../models/collection.model.js";
import Transporter from "../models/transporter.model.js";

const register = async (req, res) => {
    try {
        const { name, email, mobile, password, address, city, state, zipCode } = req.body;
        console.log("📥 Registration request received for:", { name, mobile, email });

        if (!name || !mobile || !password || !address || !city || !state || !zipCode) {
            console.warn("⚠️ Missing required fields for registration.");
            return res.status(400).json({ message: "Name, mobile, password, and full address are required" });
        }

        const existingRecyclerByMobile = await Recycler.findOne({ mobile });
        if (existingRecyclerByMobile) {
            console.warn("❌ Registration failed: Mobile number already exists:", mobile);
            return res.status(409).json({ message: "Recycler with this mobile number already exists" });
        }

        if (email) {
            const existingRecyclerByEmail = await Recycler.findOne({ email });
            if (existingRecyclerByEmail) {
                console.warn("❌ Registration failed: Email already exists:", email);
                return res.status(409).json({ message: "Recycler with this email already exists" });
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log("🔑 Password hashed for recycler:", mobile);

        const newRecycler = new Recycler({
            name,
            email,
            mobile,
            password: hashedPassword,
            location: {
                address,
                city,
                state,
                zipCode
            }
        });

        await newRecycler.save();
        console.log("✅ New recycler saved to database with ID:", newRecycler._id);

        generateToken(newRecycler._id, res);
        console.log("✅ Token generated for new recycler:", newRecycler._id);

        const { password: pwd, ...recyclerData } = newRecycler.toObject();

        res.status(201).json({
            message: "Recycler registered successfully",
            recycler: recyclerData
        });

    } catch (error) {
        console.error("💥 Registration error:", error);
        res.status(500).json({ message: "Server error during registration" });
    }
};


const login = async (req, res) => {
    try {
        const { loginId, password } = req.body; // loginId can be email or mobile
        console.log("📥 Login request received for:", { loginId });

        if (!loginId || !password) {
            console.warn("⚠️ Missing login identifier or password.");
            return res.status(400).json({ message: "Please provide both your identifier and password" });
        }

        const recycler = await Recycler.findOne({
            $or: [{ email: loginId }, { mobile: loginId }]
        });
        console.log("🔍 Recycler lookup result:", recycler ? recycler._id : "Not found");

        if (!recycler || !(await bcrypt.compare(password, recycler.password))) {
            console.warn("❌ Login failed: Invalid credentials for:", loginId);
            return res.status(401).json({ message: "Invalid credentials" });
        }

        generateToken(recycler._id, res);
        console.log("✅ Token generated for recycler:", recycler._id);

        const { password: pwd, ...recyclerData } = recycler.toObject();
        console.log("✅ Login successful. Recycler data:", recyclerData);

        res.status(200).json({
            message: "Login successful",
            recycler: recyclerData
        });

    } catch (error) {
        console.error("💥 Login error:", error);
        res.status(500).json({ message: "Server error during login" });
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
        // The middleware has already populated req.user with an ID
        const recycler = await Recycler.findById(req.user.id).select("-password");
        if (!recycler) {
            return res.status(404).json({ message: "Recycler not found" });
        }
        console.log("✅ checkUser successful for:", recycler.mobile || recycler.email);
        // --- FIX: Changed "user" key to "recycler" to match frontend expectation ---
        res.status(200).json({ recycler: recycler });
    } catch (error) {
        console.error("💥 Error in checkUser:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const updateProfile = async (req, res) => {
    try {
        const recyclerId = req.user.id;
        const { name, email, mobile, address, city, state, zipCode } = req.body;

        const updateData = { location: {} };
        if (name) updateData.name = name;

        // Handle uniqueness constraints if email/mobile are being updated
        if (email) {
            const existing = await Recycler.findOne({ email, _id: { $ne: recyclerId } });
            if (existing) return res.status(409).json({ message: "Email is already in use." });
            updateData.email = email;
        }
        if (mobile) {
            const existing = await Recycler.findOne({ mobile, _id: { $ne: recyclerId } });
            if (existing) return res.status(409).json({ message: "Mobile number is already in use." });
            updateData.mobile = mobile;
        }

        // Fetch current user to merge address fields
        const currentUser = await Recycler.findById(recyclerId);
        updateData.location.address = address || currentUser.location.address;
        updateData.location.city = city || currentUser.location.city;
        updateData.location.state = state || currentUser.location.state;
        updateData.location.zipCode = zipCode || currentUser.location.zipCode;

        const updatedRecycler = await Recycler.findByIdAndUpdate(
            recyclerId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedRecycler) {
            return res.status(404).json({ message: "Recycler not found" });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            recycler: updatedRecycler
        });

    } catch (error) {
        console.error("💥 Profile update error:", error);
        res.status(500).json({ message: "Server error during profile update" });
    }
};

const scanQRCode = async (req, res) => {
    try {
        const { scannedTransporterId } = req.body;
        const recyclerId = req.user?.id;

        if (!recyclerId) {
            return res.status(401).json({ message: "Unauthorized: Recycler ID missing." });
        }
        if (!scannedTransporterId) {
            return res.status(400).json({ message: "Scanned QR code data is missing." });
        }

        const transporter = await Transporter.findById(scannedTransporterId);
        if (!transporter) {
            return res.status(404).json({ message: "Transporter not found from QR code." });
        }

        const updateResult = await Collection.updateMany(
            {
                transporter: scannedTransporterId,
                status: 'Collected',
                recycler: { $exists: false }
            },
            { $set: { recycler: recyclerId, status: "Trash Dumped" } }
        );

        if (updateResult.modifiedCount === 0) {
            return res.status(200).json({
                message: `No new collections were available to be claimed from ${transporter.name}.`,
                claimedCount: 0
            });
        }

        res.status(200).json({
            message: `Successfully claimed ${updateResult.modifiedCount} collections from ${transporter.name}.`,
            claimedCount: updateResult.modifiedCount,
        });

    } catch (error) {
        console.error("💥 QR Scan processing error:", error);
        res.status(500).json({ message: "Server error while processing the scan.", error: error.message });
    }
};

const getRecyclerHistory = async (req, res) => {
    try {
        const recyclerId = req.user.id;
        console.log(`🔍 Fetching history for recycler ID: ${recyclerId}`);

        const history = await Collection.find({ recycler: recyclerId })
            .populate('user', 'name')
            .populate('transporter', 'name')
            .sort({ updatedAt: -1 });

        if (!history || history.length === 0) {
            return res.status(200).json({ message: "No history found.", history: [] });
        }

        console.log(`✅ Found ${history.length} history records for recycler.`);
        res.status(200).json({ history });

    } catch (error) {
        console.error("💥 Error fetching recycler history:", error);
        res.status(500).json({ message: "Server error while fetching history." });
    }
};

export { register, login, logout, checkUser, updateProfile, scanQRCode, getRecyclerHistory };