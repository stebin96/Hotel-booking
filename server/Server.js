import express from "express";
import "dotenv/config";
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from "./config/db.js";
import { clerkMiddleware } from '@clerk/express';
import clerkWebhooks from "./controllers/clerkWebhooks.js";
import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// ✅ Raw body for Clerk webhooks must be BEFORE express.json()
app.post("/api/clerk", bodyParser.raw({ type: "application/json" }), clerkWebhooks);

// ✅ Routes
app.use('/api/user', userRouter)
app.use('/api/hotels', hotelRouter)

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("✅ Backend is running successfully on Vercel");
});

// ✅ Connect DB before anything else
const startApp = async () => {
  await connectDB();
  console.log("🚀 App is ready");
};

startApp();

export default app;
