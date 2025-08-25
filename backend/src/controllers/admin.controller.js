import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import Transporter from '../models/transporter.model.js';
import Recycler from '../models/recycler.model.js';
import Collection from '../models/collection.model.js';

// ## Dashboard Controller ##

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


// ## Recycler Management Controllers ##

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