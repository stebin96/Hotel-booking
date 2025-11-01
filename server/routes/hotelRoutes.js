import express from "express";
import { registerHotel, getAllHotels } from "../controllers/hotelController.js";
import { protect } from "../middleware/authMiddleware.js";

const hotelRouter = express.Router();

hotelRouter.get('/', getAllHotels); 
hotelRouter.post('/', protect, registerHotel);

export default hotelRouter;