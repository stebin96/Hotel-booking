import Hotel from "../models/Hotel.js";
import User from "../models/User.js";

export const registerHotel = async (req, res) => {
  try {
    const { name, address, contact, city } = req.body;
    const owner = req.user._id;

    // Check if the user already registered a hotel
    const existingHotel = await Hotel.findOne({ owner });
    if (existingHotel) {
      return res.json({ success: false, message: "Hotel already registered" });
    }

    // Create new hotel
    await Hotel.create({ name, address, contact, city, owner });

    // Update user's role
    await User.findByIdAndUpdate(owner, { role: "hotelOwner" });

    res.json({ success: true, message: "Hotel registered successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ✅ NEW: Get all hotels (for testing / admin panel / frontend listing)
export const getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find().populate("owner", "email"); // optional populate
    res.json({ success: true, hotels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
