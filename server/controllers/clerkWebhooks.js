import mongoose from "mongoose";
import express from "express";
import "dotenv/config";
import cors from "cors";
import { Webhook } from "svix";
import User from "../models/User.js";

const app = express();

// ✅ Middleware
app.use(cors());

// ------------------------
// Clerk webhook route
// ------------------------
app.post("/api/clerk", async (req, res) => {
  try {
    // For Vercel, req.body is already a stream
    const rawBody = await getRawBody(req); // get raw buffer

    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    // Verify webhook
    await whook.verify(rawBody, headers);

    const { type, data } = JSON.parse(rawBody.toString());

    const userData = {
      _id: data.id,
      email: data.email_addresses?.[0]?.email_address || "",
      username: `${data.first_name || ""} ${data.last_name || ""}`,
      image: data.image_url || "",
    };

    switch (type) {
      case "user.created":
        await User.create(userData);
        console.log("✅ User Created:", userData);
        break;
      case "user.updated":
        await User.findByIdAndUpdate(data.id, userData);
        console.log("♻️ User Updated:", userData);
        break;
      case "user.deleted":
        await User.findByIdAndDelete(data.id);
        console.log("🗑 User Deleted:", data.id);
        break;
      default:
        console.log("⚠️ Unhandled event type:", type);
    }

    return res.status(200).json({ success: true, message: "Webhook processed" });
  } catch (err) {
    console.error("❌ Webhook Error:", err.message);
    return res.status(400).json({ success: false, message: err.message });
  }
});

// ------------------------
// Helper to get raw body
// ------------------------
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = [];
    req.on("data", (chunk) => data.push(chunk));
    req.on("end", () => resolve(Buffer.concat(data)));
    req.on("error", (err) => reject(err));
  });
}

export default app;
