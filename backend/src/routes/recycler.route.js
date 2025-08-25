import express from "express";

const router = express.Router();
import { register,login,logout,checkUser,updateProfile,scanQRCode } from "../controllers/recycler.controller.js";
import recyclerMiddleware from "../middlewares/recycler.middleware.js";
router.post("/register",register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/check-user",recyclerMiddleware,checkUser);
router.put("/update-profile",recyclerMiddleware,updateProfile);

router.post("/scan", recyclerMiddleware, scanQRCode);

export default router;
