import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import Transporter from '../models/transporter.model.js';
import Recycler from '../models/recycler.model.js';
import Collection from '../models/collection.model.js';
import Admin from '../models/admin.model.js';
<<<<<<< HEAD
import TransporterHistory from '../models/transporterhistory.model.js';
import { generateToken } from '../utils/jwt.js'
import QRCode from 'qrcode';
import cloudinary from '../config/cloudinary.js';
=======
import { generateToken } from '../utils/jwt.js'
>>>>>>> c81b36c7c0fb29733e30c3d4a9ebe4328a1c4683

// ## Dashboard Controller ##
export const checkUser = async (req, res) => {
    try {
        const user = await Admin.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user });
    } catch (error) {
        console.error("Error in checkUser: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("📥 Login request received: in admin.controller.js", { email, password }); // log raw input (⚠️ remove in production)

        if (!email || !password) {
            console.warn("⚠️ Missing email or password");
            return res.status(400).json({ message: "Please enter email and password" });
        }

        // The fix is to add .select('+password')
        const user = await Admin.findOne({ email }).select('+password');
        console.log("🔍 User lookup result:", user ? user.email : "Not found");

        if (!user) {
            console.warn("❌ Login failed: User not found for email:", email);
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("🔑 Password match:", isMatch);

        if (!isMatch) {
            console.warn("❌ Login failed: Password mismatch for email:", email);
            return res.status(401).json({ message: "Invalid email or password" });
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


/**
 * @description Fetches summary statistics for the admin dashboard.
 * @route GET /api/admin/stats
 */
export const getDashboardStats = async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const transporterCount = await Transporter.countDocuments();
        const recyclerCount = await Recycler.countDocuments();

        // Calculate total weight collected using an aggregation pipeline
        const weightData = await Collection.aggregate([
            {
                $group: {
                    _id: null,
                    totalWeight: { $sum: '$weight' }
                }
            }
        ]);

        const totalWeightCollected = weightData.length > 0 ? weightData[0].totalWeight : 0;

        res.status(200).json({
            userCount,
            transporterCount,
            recyclerCount,
            totalWeightCollected
        });
    } catch (error) {
        console.error("Error in getDashboardStats: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// ## User Management Controllers ##

/**
 * @description Retrieves a list of all registered regular users.
 * @route GET /api/admin/users
 */
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json(users);
    } catch (error) {
        console.error("Error in getAllUsers: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * @description Gets the detailed profile of a single user by their unique ID.
 * @route GET /api/admin/users/:id
 */
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Error in getUserById: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * @description Gets all collections for a specific user.
 * @route GET /api/admin/users/:id/collections
 */
export const getUserCollections = async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Find collections where this user is the source
        const collections = await Collection.find({ user: userId })
            .populate('transporter', 'name email')
            .populate('recycler', 'name email')
            .sort({ createdAt: -1 });
            
        res.status(200).json(collections);
    } catch (error) {
        console.error("Error in getUserCollections: ", error.message);
        res.status(500).json({ message: "Failed to fetch user collections" });
    }
};

/**
 * @description Updates a specific user's profile information for support or correction.
 * @route PUT /api/admin/users/:id
 */
export const updateUserById = async (req, res) => {
    try {
        const { name, address } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, 
            { name, address }, 
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error in updateUserById: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// ## Transporter Management Controllers ##

/**
 * @description Retrieves a list of all registered transporters.
 * @route GET /api/admin/transporters
 */
export const getAllTransporters = async (req, res) => {
    try {
        const transporters = await Transporter.find({}).select('-password');
        res.status(200).json(transporters);
    } catch (error) {
        console.error("Error in getAllTransporters: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * @description Creates a new transporter account in the system.
 * @route POST /api/admin/transporters
 */
export const createTransporter = async (req, res) => {
    try {
        const { name, email, password, vehicleInfo } = req.body;

        const existingTransporter = await Transporter.findOne({ email });
        if (existingTransporter) {
            return res.status(400).json({ error: "Transporter with this email already exists." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newTransporter = new Transporter({
            name,
            email,
            password: hashedPassword,
            vehicleInfo
        });

        await newTransporter.save();

<<<<<<< HEAD
        try {
            // Generate QR code for the new transporter
            const qrDataUrl = await QRCode.toDataURL(newTransporter._id.toString());
            console.log('QR code generated successfully for new transporter:', newTransporter._id);

            // Upload QR to cloudinary
            const uploadResult = await cloudinary.uploader.upload(qrDataUrl, {
                folder: "qr_codes",
                public_id: `transporter_qr_${newTransporter._id}`,
                overwrite: true
            });
            console.log('QR code uploaded to Cloudinary successfully:', uploadResult.secure_url);

            // Save QR code URL in DB
            newTransporter.qrCodeUrl = uploadResult.secure_url;
            await newTransporter.save();
            console.log('QR code URL saved to transporter document');
        } catch (qrError) {
            console.error('Error generating QR code:', qrError);
            // Continue with the response even if QR code generation fails
        }

=======
>>>>>>> c81b36c7c0fb29733e30c3d4a9ebe4328a1c4683
        res.status(201).json({ 
            message: "Transporter created successfully",
            transporterId: newTransporter._id 
        });
    } catch (error) {
        console.error("Error in createTransporter: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * @description Updates a specific transporter's profile or vehicle information.
 * @route PUT /api/admin/transporters/:id
 */
export const updateTransporterById = async (req, res) => {
    try {
        // Exclude password from being updated this way
        const { name, email, vehicleInfo, walletBalance } = req.body;

        const updatedTransporter = await Transporter.findByIdAndUpdate(
            req.params.id, 
            { name, email, vehicleInfo, walletBalance },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!updatedTransporter) {
            return res.status(404).json({ error: "Transporter not found" });
        }

        res.status(200).json(updatedTransporter);
    } catch (error) {
        console.error("Error in updateTransporterById: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


/**
 * @description Gets all collections for a specific transporter.
 * @route GET /api/admin/transporters/:id/collections
 */
export const getTransporterCollections = async (req, res) => {
    try {
        const transporterId = req.params.id;
        
        // Verify transporter exists
        const transporter = await Transporter.findById(transporterId).select('-password');
        if (!transporter) {
            return res.status(404).json({ error: "Transporter not found" });
        }
        
        // Get all collections for this transporter
        const collections = await Collection.find({ transporter: transporterId })
            .populate('user', 'name')
            .populate('recycler', 'name')
            .sort({ createdAt: -1 });
            
        // Calculate total waste collected
        const totalWeight = collections.reduce((sum, collection) => sum + collection.weight, 0);
        
        // Calculate waste by type
        const wasteByType = collections.reduce((acc, collection) => {
            acc.wet += collection.wasteTypes?.wet || 0;
            acc.dry += collection.wasteTypes?.dry || 0;
            acc.hazardous += collection.wasteTypes?.hazardous || 0;
            return acc;
        }, { wet: 0, dry: 0, hazardous: 0 });
        
        // Calculate waste given to recyclers
        const wasteToRecyclers = collections.reduce((sum, collection) => {
            if (collection.recycler) {
                return sum + collection.weight;
            }
            return sum;
        }, 0);
        
        res.status(200).json({
            transporter,
            collections,
            stats: {
                totalCollections: collections.length,
                totalWeight,
                wasteByType,
                wasteToRecyclers,
                pendingWaste: totalWeight - wasteToRecyclers
            }
        });
    } catch (error) {
        console.error("Error in getTransporterCollections: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

<<<<<<< HEAD
/**
 * @description Gets location history for a specific transporter.
 * @route GET /api/admin/transporters/:id/location-history
 */
export const getTransporterLocationHistory = async (req, res) => {
    try {
        const transporterId = req.params.id;
        
        // Verify transporter exists
        const transporter = await Transporter.findById(transporterId).select('-password');
        if (!transporter) {
            return res.status(404).json({ error: "Transporter not found" });
        }
        
        // Get the date parameter from query or use today's date
        let date = req.query.date ? new Date(req.query.date) : new Date();
        date.setHours(0, 0, 0, 0); // Set to midnight for proper date comparison
        
        // Find transporter history for the specified date
        const history = await TransporterHistory.findOne({
            transporter: transporterId,
            date: date
        });
        
        if (!history || history.checkpoints.length === 0) {
            return res.status(200).json({
                transporter,
                date: date,
                checkpoints: [],
                message: "No location history found for this date"
            });
        }
        
        // Find collections for this transporter on this date that have been delivered to a recycler
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        const deliveredCollection = await Collection.findOne({
            transporter: transporterId,
            createdAt: { $gte: date, $lte: endOfDay },
            recycler: { $exists: true, $ne: null }
        }).populate('recycler', 'name address');
        
        // Include recycler info if available
        const recyclerInfo = deliveredCollection ? deliveredCollection.recycler : null;
        
        res.status(200).json({
            transporter,
            date: history.date,
            checkpoints: history.checkpoints,
            recyclerInfo
        });
    } catch (error) {
        console.error("Error in getTransporterLocationHistory: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

=======
>>>>>>> c81b36c7c0fb29733e30c3d4a9ebe4328a1c4683
// ## Recycler Management Controllers ##

/**
 * @description Retrieves collections for a specific recycler with statistics.
 * @route GET /api/admin/recyclers/:id/collections
 */
export const getRecyclerCollections = async (req, res) => {
    try {
        const recyclerId = req.params.id;
        
        // Get recycler details
        const recycler = await Recycler.findById(recyclerId).select('-password');
        if (!recycler) {
            return res.status(404).json({ error: "Recycler not found" });
        }
        
        // Get all collections for this recycler
        const collections = await Collection.find({ recycler: recyclerId })
            .populate('user', 'name')
            .populate('transporter', 'name vehicleNumber')
            .sort({ createdAt: -1 });
            
        // Calculate total waste collected
        const totalWeight = collections.reduce((sum, collection) => sum + collection.weight, 0);
        
        // Calculate waste by type
        const wasteByType = collections.reduce((acc, collection) => {
            acc.wet += collection.wasteTypes?.wet || 0;
            acc.dry += collection.wasteTypes?.dry || 0;
            acc.hazardous += collection.wasteTypes?.hazardous || 0;
            return acc;
        }, { wet: 0, dry: 0, hazardous: 0 });
        
        // Calculate waste by transporter
        const wasteByTransporter = collections.reduce((acc, collection) => {
            const transporterId = collection.transporter?._id.toString();
            if (transporterId) {
                if (!acc[transporterId]) {
                    acc[transporterId] = {
                        name: collection.transporter.name,
                        vehicleNumber: collection.transporter.vehicleNumber,
                        weight: 0
                    };
                }
                acc[transporterId].weight += collection.weight;
            }
            return acc;
        }, {});
        
        res.status(200).json({
            recycler,
            collections,
            stats: {
                totalCollections: collections.length,
                totalWeight,
                wasteByType,
                wasteByTransporter: Object.values(wasteByTransporter)
            }
        });
    } catch (error) {
        console.error("Error in getRecyclerCollections: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * @description Retrieves a list of all registered recyclers.
 * @route GET /api/admin/recyclers
 */
export const getAllRecyclers = async (req, res) => {
    try {
        const recyclers = await Recycler.find({}).select('-password');
        res.status(200).json(recyclers);
    } catch (error) {
        console.error("Error in getAllRecyclers: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * @description Creates a new recycler account in the system.
 * @route POST /api/admin/recyclers
 */
export const createRecycler = async (req, res) => {
    try {
        const { name, email, password, location } = req.body;
        
        const existingRecycler = await Recycler.findOne({ email });
        if (existingRecycler) {
            return res.status(400).json({ error: "Recycler with this email already exists." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newRecycler = new Recycler({
            name,
            email,
            password: hashedPassword,
            location
        });

        await newRecycler.save();
        
        res.status(201).json({ 
            message: "Recycler created successfully",
            recyclerId: newRecycler._id 
        });
    } catch (error) {
        console.error("Error in createRecycler: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * @description Updates a specific recycler's profile information.
 * @route PUT /api/admin/recyclers/:id
 */
export const updateRecyclerById = async (req, res) => {
    try {
        // Exclude password from being updated this way
        const { name, email, location } = req.body;

        const updatedRecycler = await Recycler.findByIdAndUpdate(
            req.params.id, 
            { name, email, location },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!updatedRecycler) {
            return res.status(404).json({ error: "Recycler not found" });
        }

        res.status(200).json(updatedRecycler);
    } catch (error) {
        console.error("Error in updateRecyclerById: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};