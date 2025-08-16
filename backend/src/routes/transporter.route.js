import express from 'express';
const router = express.Router();
import {
    register,
    login,
    logout,
    checkUser,
    updateProfile,
    scan
} from '../controllers/transporter.controller.js';
import protectedRoute  from '../middlewares/user.middleware.js';

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/check-user", protectedRoute, checkUser);
router.put("/update-profile", protectedRoute, updateProfile);

router.post("/scan", protectedRoute, scan);

export default router;