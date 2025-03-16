import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const mongo_uri = process.env.MONGO_URI;
export const connectDB = async () => {
  await mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => console.error("MongoDB connection error:", err));
};
