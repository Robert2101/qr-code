import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { authRoutes } from "./routes/auth.route.js";
import transporterRoutes from "./routes/transporter.route.js";
import recyclerRoutes from "./routes/recycler.route.js"

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors(
    {
        origin:"http://localhost:5173",
        credentials: true,
    }
));


const PORT = process.env.PORT || 5001;

app.use("/api/auth", authRoutes);
app.use("/api/transporter", transporterRoutes);
app.use("/api/recycler", recyclerRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
    connectDB();
});
