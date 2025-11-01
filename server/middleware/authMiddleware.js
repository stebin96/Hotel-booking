import { requireAuth } from "@clerk/express";
import User from "../models/User.js";

export const protect = [
  requireAuth(), // ✅ Ensures user is authenticated by Clerk

  async (req, res, next) => {
    try {
      const userId = req.auth.userId; // Clerk adds this after requireAuth

      if (!userId) {
        return res.status(401).json({ success: false, message: "User not authenticated" });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found in database" });
      }

      req.user = user; // Attach user data for next middleware/controllers
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Authentication error",
        error: error.message,
      });
    }
  },
];
