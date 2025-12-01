import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import riderRoutes from "./routes/riderRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configure CORS to allow requests from your frontend
app.use(cors({
  origin: '*', // In production, specify your frontend URL
  credentials: true
}));

app.use(express.json());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, "../frontend")));

// API Routes
app.use("/auth", authRoutes);
app.use("/rider", riderRoutes);
app.use("/driver", driverRoutes);

// Root route - serve login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

// Fallback for any other routes - serve login page
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

export default app;