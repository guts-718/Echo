import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import { connectDB } from "./utils/db.js";
dotenv.config();
const app = express();

// very important
app.use(cors());
app.use(express.json()); // parses incoming body
app.use(express.urlencoded({ extended: true })); // to parse form data urlencoded

app.use("/api/auth", authRoutes);
app.get("/", (req, res) => {
  res.send("hey there");
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on Port ", PORT);
  connectDB();
});
