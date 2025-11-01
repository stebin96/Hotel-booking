import mongoose from "mongoose";
import express from "express";
import "dotenv/config";
import cors from "cors";
import { Webhook } from "svix";
import User from "../models/User.js"; // ✅ make sure path is correct
import hotelRouter from "../routes/hotelRoutes.js"; // ✅ add your routes

const app = express();

// ✅ Middleware for JSON and Raw Body (important for Clerk & other APIs)
app.use(cors());
app.use(express.json({
  verify: (req, res, buf) => {
    // Store raw body for Clerk webhook verification
    if (req.originalUrl === "/api/clerk") {
      req.rawBody = buf;
    }
  },
}));

// ------------------------
// MongoDB Connection
// ------------------------
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Failed:", err));

// ------------------------
// Clerk Webhook Route
// ------------------------
app.post("/api/clerk", async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    const payload = req.rawBody.toString();

    // ✅ Verify Clerk Webhook Signature
    const evt = await whook.verify(payload, headers);
    const { type, data } = evt;

    const userData = {
      _id: data.id,
      email: data.email_addresses?.[0]?.email_address || "",
      username: `${data.first_name || ""} ${data.last_name || ""}`,
      image: data.image_url || "",
    };

    if (type === "user.created") {
      await User.create(userData);
      console.log("✅ User Created:", userData);
    } else if (type === "user.updated") {
      await User.findByIdAndUpdate(data.id, userData);
      console.log("♻️ User Updated:", userData);
    } else if (type === "user.deleted") {
      await User.findByIdAndDelete(data.id);
      console.log("🗑 User Deleted:", data.id);
    }

    return res.status(200).json({ success: true, message: "Webhook processed" });
  } catch (err) {
    console.error("❌ Webhook Error:", err.message);
    return res.status(400).json({ success: false, message: err.message });
  }
});

// ------------------------
// Routes
// ------------------------
app.use("/api/hotels", hotelRouter);

// ------------------------
// Root Test Route
// ------------------------
app.get("/", (req, res) => {
  res.send("✅ Hotel Booking Backend is running");
});

// ✅ Export (for serverless platforms like Vercel)
export default app;

// ✅ If running locally (not on Vercel), start server:
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}
