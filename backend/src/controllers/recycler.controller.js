import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";
import Recycler from "../models/recycler.model.js";
import Collection from "../models/collection.model.js";
import Transporter from "../models/transporter.model.js"
const register = async (req, res) => {
    try {
        const { name, email, password, address, city, state, zipCode } = req.body;
        console.log("📥 Registration request received for:", { name, email });

        if (!name || !email || !password || !address || !city || !state || !zipCode) {
            console.warn("⚠️ Missing required fields for registration.");
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingRecycler = await Recycler.findOne({ email });
        if (existingRecycler) {
            console.warn("❌ Registration failed: Email already exists:", email);
            return res.status(409).json({ message: "Recycler with this email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log("🔑 Password hashed for user:", email);

        const newRecycler = new Recycler({
            name,
            email,
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

        // 5. Generate the JWT using the utility function
        const token = generateToken(newRecycler._id,res);
        console.log("✅ Token generated for new recycler:", newRecycler._id);

        const { password: pwd, ...recyclerData } = newRecycler.toObject();

        res.status(201).json({
            message: "Recycler registered successfully",
            token,
            recycler: recyclerData
        });

    } catch (error) {
        console.error("💥 Registration error:", error);
        res.status(500).json({ message: "Server error during registration" });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("📥 Login request received for:", { email });

        if (!email || !password) {
            console.warn("⚠️ Missing email or password for login.");
            return res.status(400).json({ message: "Please provide both email and password" });
        }

        const recycler = await Recycler.findOne({ email });
        console.log("🔍 Recycler lookup result:", recycler ? recycler.email : "Not found");

        if (!recycler || !(await bcrypt.compare(password, recycler.password))) {
            console.warn("❌ Login failed: Invalid credentials for email:", email);
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = generateToken(recycler._id, res);
        console.log("✅ Token generated for user:", recycler._id);

        const { password: pwd, ...recyclerData } = recycler.toObject();
        console.log("✅ Login successful. Recycler data:", recyclerData);

        res.status(200).json({
            message: "Login successful",
            token,
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

const checkUser = (req, res) => {
    // The recyclerMiddleware has already done the heavy lifting:
    // 1. Verified the JWT from the cookie.
    // 2. Found the recycler in the database.
    // 3. Attached the recycler's data to `req.user`.
    // So, we just need to send back the `req.user` object.
    try {
        console.log("✅ checkUser successful for:", req.user.email);
        res.status(200).json(req.user);
    } catch (error) {
        console.error("💥 Error in checkUser:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const updateProfile = async (req, res) => {
    try {
        // The ID of the logged-in user is available from the middleware
        const recyclerId = req.user._id;
        console.log(`📥 Profile update request received for user ID: ${recyclerId}`);

        // Find the most current version of the recycler from the DB
        const recycler = await Recycler.findById(recyclerId);

        if (!recycler) {
            console.warn(`❌ Profile update failed: Recycler not found with ID: ${recyclerId}`);
            return res.status(404).json({ message: "Recycler not found" });
        }

        // Update fields only if they are provided in the request body
        recycler.name = req.body.name || recycler.name;
        recycler.email = req.body.email || recycler.email;
        recycler.location.address = req.body.address || recycler.location.address;
        recycler.location.city = req.body.city || recycler.location.city;
        recycler.location.state = req.body.state || recycler.location.state;
        recycler.location.zipCode = req.body.zipCode || recycler.location.zipCode;

        // Save the updated document
        const updatedRecycler = await recycler.save();
        console.log(`✅ Profile updated successfully for user ID: ${recyclerId}`);

        // Prepare the response object, excluding the password
        const { password, ...recyclerData } = updatedRecycler.toObject();

        res.status(200).json({
            message: "Profile updated successfully",
            recycler: recyclerData
        });

    } catch (error) {
        console.error("💥 Profile update error:", error);
        res.status(500).json({ message: "Server error during profile update" });
    }
};

const scanQRCode = async (req, res) => {
    try {
        console.log("📌 Incoming scan request body:", req.body);
        console.log("📌 Incoming user from middleware:", req.user);

        const { scannedTransporterId } = req.body;
        const recyclerId = req.user?._id;
        const recyclerName = req.user?.name;

        if (!recyclerId) {
            console.warn("⚠️ No recyclerId found in req.user");
            return res.status(401).json({ message: "Unauthorized: Recycler not found in request." });
        }

        if (!scannedTransporterId) {
            console.warn("⚠️ scannedTransporterId missing in request body");
            return res.status(400).json({ message: "Scanned QR code is invalid or empty." });
        }

        console.log(`🔍 Checking transporter with ID: ${scannedTransporterId}`);
        const transporterExists = await Transporter.findById(scannedTransporterId);

        if (!transporterExists) {
            console.warn(`❌ No transporter found with ID: ${scannedTransporterId}`);
            return res.status(404).json({ message: "Transporter not found. The QR code may be invalid." });
        }

        console.log(`✅ Recycler ${recyclerName} (${recyclerId}) is claiming collections from Transporter ${transporterExists.name} (${transporterExists._id})`);

        console.log("🔍 Searching for collections with status 'Collected' and no recycler...");
        const collectionsToClaim = await Collection.find({
            transporter: scannedTransporterId,
            status: 'Collected',
            recycler: { $exists: false }
        });

        console.log(`📊 Found ${collectionsToClaim.length} collections to claim.`);

        if (collectionsToClaim.length === 0) {
            console.log(`ℹ️ No collections ready to claim for transporter ${transporterExists.name}`);
            return res.status(200).json({
                message: "No new collected items were available to be claimed from this transporter.",
                claimedCount: 0
            });
        }

        let estimatedTotalWeight = 0;
        const estimatedCategoricalWeights = { wet: 0, dry: 0, hazardous: 0 };
        const collectionIdsToUpdate = [];

        for (const collection of collectionsToClaim) {
            console.log(`📦 Processing collection ${collection._id}, weight: ${collection.weight}, wasteTypes:`, collection.wasteTypes);
            estimatedTotalWeight += collection.weight || 0;
            estimatedCategoricalWeights.wet += collection.wasteTypes?.wet || 0;
            estimatedCategoricalWeights.dry += collection.wasteTypes?.dry || 0;
            estimatedCategoricalWeights.hazardous += collection.wasteTypes?.hazardous || 0;
            collectionIdsToUpdate.push(collection._id);
        }

        console.log("📌 Total weight:", estimatedTotalWeight);
        console.log("📌 Categorical weights:", estimatedCategoricalWeights);
        console.log("📌 Collection IDs to update:", collectionIdsToUpdate);

        if (collectionIdsToUpdate.length > 0) {
            const updateResult = await Collection.updateMany(
                { _id: { $in: collectionIdsToUpdate } },
                { $set: { recycler: recyclerId, status: "Claimed" } }
            );
            console.log(`✅ Updated ${updateResult.modifiedCount} collections to Claimed for recycler ${recyclerName}`);
        }

        res.status(200).json({
            message: `Successfully claimed ${collectionsToClaim.length} collections from ${transporterExists.name}.`,
            claimedCount: collectionsToClaim.length,
            estimatedTotalWeight,
            estimatedCategoricalWeights
        });

    } catch (error) {
        console.error("💥 QR Scan processing error:", error);
        res.status(500).json({ message: "Server error while processing the scan.", error: error.message });
    }
};



export { register, login, logout, checkUser, updateProfile, scanQRCode };