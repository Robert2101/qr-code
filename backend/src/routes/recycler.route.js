import express from "express";

const router = express.Router();
import { register,login,logout,checkUser,updateProfile,scanQRCode,getRecyclerHistory, getPendingCollections,submitRevenueRequest } from "../controllers/recycler.controller.js";
import recyclerMiddleware from "../middlewares/recycler.middleware.js";
router.post("/register",register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/check-user",recyclerMiddleware,checkUser);
router.put("/update-profile",recyclerMiddleware,updateProfile);

router.post("/scan", recyclerMiddleware, scanQRCode);
router.get("/history", recyclerMiddleware, getRecyclerHistory);

router.get("/pending-collections", recyclerMiddleware, getPendingCollections);
router.post("/submit-revenue-request", recyclerMiddleware, submitRevenueRequest);


export default router;
