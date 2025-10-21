import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./config/db.js";
import { clerkMiddleware } from '@clerk/express';
import clerkWebhooks from "./controllers/clerkWebhooks.js";

connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// Clerk webhook API
app.use("/api/clerk", clerkWebhooks);

// Root test route
app.get("/", (req, res) => res.send("API is working fine on Vercel ✅"));

// 🚫 Do not use app.listen on Vercel! Instead export:
export default app;
