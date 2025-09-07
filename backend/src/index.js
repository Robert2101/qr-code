import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { authRoutes } from "./routes/auth.route.js";
import transporterRoutes from "./routes/transporter.route.js";
import recyclerRoutes from "./routes/recycler.route.js";
import adminRoutes from "./routes/admin.route.js"

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors(
    {
<<<<<<< HEAD
        origin:["http://localhost:5173", "http://localhost:5174"],
=======
        origin:"http://localhost:5173",
>>>>>>> c81b36c7c0fb29733e30c3d4a9ebe4328a1c4683
        credentials: true,
    }
));


const PORT = process.env.PORT || 5001;

app.use("/api/auth", authRoutes);
app.use("/api/transporter", transporterRoutes);
app.use("/api/recycler", recyclerRoutes);
app.use("/api/admin", adminRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
    connectDB();
});
