import express from 'express';
import adminMiddleware from '../middlewares/admin.middleware.js';

// Import all necessary controller functions from your admin controller file
import { 
    getDashboardStats,
    getAllUsers, 
    getUserById,
    updateUserById,
    getUserCollections,
    getAllTransporters,
    createTransporter,
    updateTransporterById,
    getTransporterCollections,
    getTransporterLocationHistory,
    getAllRecyclers,
    createRecycler,
    updateRecyclerById,
    getRecyclerCollections,
    login,
    checkUser,
    getRevenueRequests,
    approveRevenueRequest,
    declineRevenueRequest
} from '../controllers/admin.controller.js';

const router = express.Router();


router.post('/login', login);
router.use(adminMiddleware);
router.get('/check-user', checkUser);
router.post('/logout', (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logout successful" });
    } catch (err) {
        console.error("error in logout:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// ## Dashboard Routes ##
router.get('/stats', getDashboardStats);

// ## User Management Routes ##
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUserById); // For admin support and data correction
router.get('/users/:id/collections', getUserCollections);

// ## Transporter Management Routes ##
router.get('/transporters', getAllTransporters);
router.post('/transporters', createTransporter);
router.put('/transporters/:id', updateTransporterById);
router.get('/transporters/:id/collections', getTransporterCollections);
router.get('/transporters/:id/location-history', getTransporterLocationHistory);

// ## Recycler Management Routes ##
router.get('/recyclers', getAllRecyclers);
router.post('/recyclers', createRecycler);
router.put('/recyclers/:id', updateRecyclerById);
router.get('/recyclers/:id/collections', getRecyclerCollections);

router.get('/revenue-requests', getRevenueRequests);
router.post('/revenue-requests/:requestId/approve', approveRevenueRequest);
router.post('/revenue-requests/:requestId/decline', declineRevenueRequest);

export default router;