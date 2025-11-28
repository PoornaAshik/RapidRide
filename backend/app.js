import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import riderRoutes from './routes/riderRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configure CORS to allow requests from your frontend
app.use(cors({
  origin: '*', // In production, specify your frontend URL
  credentials: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use("/auth", authRoutes);
app.use('/api', riderRoutes);
app.use('/api/driver', driverRoutes);

// Serve login page at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'login.html'));
});

export default app;