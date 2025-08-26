import express from 'express';
import adminMiddleware from '../middlewares/admin.middleware.js';

// Import all necessary controller functions from your admin controller file
import { 
    getDashboardStats,
    getAllUsers, 
    getUserById,
    updateUserById,
    getAllTransporters,
    createTransporter,
    updateTransporterById,
    getAllRecyclers,
    createRecycler,
    login,
    checkUser
} from '../controllers/admin.controller.js';

const router = express.Router();


router.post('/login', login);
router.use(adminMiddleware);
router.get('/check-user', checkUser);

// ## Dashboard Routes ##
router.get('/stats', getDashboardStats);

// ## User Management Routes ##
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUserById); // For admin support and data correction

// ## Transporter Management Routes ##
router.get('/transporters', getAllTransporters);
router.post('/transporters', createTransporter);
router.put('/transporters/:id', updateTransporterById);

// ## Recycler Management Routes ##
router.get('/recyclers', getAllRecyclers);
router.post('/recyclers', createRecycler);

export default router;