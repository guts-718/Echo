import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import { connectDB } from "./utils/db.js";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
dotenv.config();
const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// very important
app.use(cookieParser());
app.use(cors());
app.use(express.json({ limit: "5mb" })); // parses incoming body
app.use(express.urlencoded({ extended: true })); // to parse form data urlencoded
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);
app.use("/api/notification", notificationRoutes);
app.get("/", (req, res) => {
  res.send("hey there");
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on Port ", PORT);
  connectDB();
});
