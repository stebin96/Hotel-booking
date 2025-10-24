import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
  try {
    // Initialize the Svix webhook verifier
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    // Verify the webhook using the raw body
    await whook.verify(req.body, headers);

    // Parse the raw body
    const { data, type } = JSON.parse(req.body.toString());

    // Build user data safely with optional chaining
    const userData = {
      _id: data.id,
      email: data.email_addresses?.[0]?.email_address || "", // safe fallback
      username: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
      image: data.image_url || "",
    };

    // Handle the different webhook event types
    switch (type) {
      case "user.created":
        // Only create if user doesn't exist
        if (!(await User.findById(data.id))) {
          await User.create(userData);
          console.log("✅ User Created:", userData);
        } else {
          console.log("⚠️ User already exists:", userData._id);
        }
        break;

      case "user.updated":
        await User.findByIdAndUpdate(data.id, userData, { new: true });
        console.log("♻️ User Updated:", userData);
        break;

      case "user.deleted":
        const deletedUser = await User.findByIdAndDelete(data.id);
        if (deletedUser) {
          console.log("🗑 User Deleted:", data.id);
        } else {
          console.log("⚠️ User not found for deletion:", data.id);
        }
        break;

      default:
        console.log("⚠️ Unhandled event type:", type);
    }

    return res.status(200).json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error("❌ Webhook Error:", error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
};

export default clerkWebhooks;
