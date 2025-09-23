import express from 'express';

const router = express.Router();

import { login, register, logout, checkUser, updateProfile, getQR,getCollections, getWallet, verifyOtp } from '../controllers/auth.controller.js';
import protectedRoute from '../middlewares/user.middleware.js';

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/verify-otp', verifyOtp);
router.get('/check-user', protectedRoute, checkUser);
router.put('/update-profile', protectedRoute, updateProfile);

router.get("/qr", protectedRoute, getQR);
router.get("/collections", protectedRoute, getCollections);
router.get("/wallet", protectedRoute, getWallet);

export { router as authRoutes };