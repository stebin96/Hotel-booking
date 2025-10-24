import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"]
    };

    await whook.verify(req.body, headers); // ✅ Passing raw body directly

    const { data, type } = JSON.parse(req.body.toString());

    const userData = {
      _id: data.id,
      email: data.email_addresses[0].email_address,
      username: `${data.first_name} ${data.last_name}`,
      image: data.image_url
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

  } catch (error) {
    console.error("❌ Webhook Error:", error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
};

export default clerkWebhooks;
