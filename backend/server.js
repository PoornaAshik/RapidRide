import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./app.js";

dotenv.config();

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5500;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📱 Open this URL in your browser to access RapidRide`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/auth, /rider, /driver`);
});
