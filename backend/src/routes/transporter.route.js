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
import { protectedRoute } from '../middlewares/user.middleware.js';

router.post("/transporter/register", register);
router.post("/transporter/login", login);
router.post("/transporter/logout", logout);
router.get("/transporter/check-user", protectedRoute, checkUser);
router.put("/transporter/update-profile", protectedRoute, updateProfile);

router.post("/transporter/scan", protectedRoute, scan);
