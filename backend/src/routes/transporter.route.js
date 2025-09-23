import express from 'express';
const router = express.Router();
import {
    register,
    login,
    logout,
    checkUser,
    updateProfile,
    scan,
    showQr,
    forgotPassword,
    resetPassword
} from '../controllers/transporter.controller.js';

import transporterMiddleware from "../middlewares/transporter.middleware.js";

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/check-user", transporterMiddleware, checkUser);
router.put("/update-profile", transporterMiddleware, updateProfile);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/qr", transporterMiddleware, showQr);
router.post("/scan", transporterMiddleware, scan);

export default router;