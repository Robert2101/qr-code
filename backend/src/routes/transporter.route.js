import express from 'express';
const router = express.Router();
import {
    register,
    login,
    logout,
    checkUser,
    updateProfile,
    scan,
    showQr
} from '../controllers/transporter.controller.js';

import transporterMiddleware from "../middlewares/transporter.middleware.js";

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/check-user", transporterMiddleware, checkUser);
router.put("/update-profile", transporterMiddleware, updateProfile);

router.get("/qr", showQr);
router.post("/scan", transporterMiddleware, scan);

export default router;