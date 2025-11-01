import express from "express";
import "dotenv/config";
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import clerkWebhooks from "./controllers/clerkWebhooks.js";
import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import connectCloudinary from "./config/cloudinary.js";

const app = express();

// ✅ Connect services
connectCloudinary();
connectDB();

// ✅ Webhook MUST come first (raw body, no JSON parser before this!)
app.post(
  "/api/clerk",
  bodyParser.raw({ type: "application/json" }),
  clerkWebhooks
);

// ✅ Global middlewares
app.use(cors());
app.use(express.json());        // JSON parsing applied after webhook
app.use(clerkMiddleware());     // Clerk middleware applied after webhook

// ✅ Routes
app.use("/api/user", userRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);

// ✅ Health check
app.get("/", (req, res) => {
  res.send("✅ Backend is running successfully");
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
