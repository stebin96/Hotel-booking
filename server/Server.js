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

// ✅ Connect Database
connectDB();

// ✅ Middleware
app.use(cors());

// ✅ Raw body for Clerk webhooks must be BEFORE express.json()
app.post("/api/clerk", bodyParser.raw({ type: "application/json" }), clerkWebhooks);

// ✅ Now parse JSON for all other routes
app.use(express.json());
app.use(clerkMiddleware());

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("✅ Backend is running successfully on Vercel");
});
app.use('/api/user', userRouter)
app.use('/api/hotels', hotelRouter)

// ✅ IMPORTANT: Export app instead of app.listen()
export default app;
