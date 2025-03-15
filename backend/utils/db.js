import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const mongo_uri = process.env.MONGO_URI;
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongo_uri);
    console.log("successfully connected to mongo db at ", conn.connection.host);
  } catch (error) {
    console.log("Error connecting to mongoDB", error);
  }
};
