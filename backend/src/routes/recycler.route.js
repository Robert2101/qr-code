import express from "express";

const router = express.Router();

router.post("/register", (req, res) => {
    // Registration logic here
});
router.post("/login", (req, res) => {
    // Login logic here
});
router.post("/logout", (req, res) => {
    // Logout logic here
});
router.get("/check-user", (req, res) => {
    // Check user logic here
});
router.put("/update-profile", (req, res) => {
    // Update profile logic here
});

router.post("/scan", (req, res) => {
    // Scan logic here
});

export default router;
