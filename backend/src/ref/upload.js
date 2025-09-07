import express from "express";
import dotenv from "dotenv";
import cloudinary from "./config/cloudinary.js";
import upload from "./middleware/multer.js";
import fs from "fs";

dotenv.config();
const app = express();

app.use(express.json());

app.post("/upload", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const result = await cloudinary.uploader.upload(req.file.path);

        fs.unlinkSync(req.file.path);

        res.json({
            message: "Upload successful",
            cloudinaryUrl: result.secure_url,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
