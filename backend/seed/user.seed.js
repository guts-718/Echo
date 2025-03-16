import dotenv from "dotenv";
import User from "../models/user.model.js";
import { connectDB } from "../../../chat_app/backend/src/lib/db.js";
dotenv.config();
const seedUsers = [
  {
    username: "john_doe",
    fullName: "John Doe",
    email: "johndoe@example.com",
    password: "123456",
    followers: [],
    following: [],
    profileImage: "",
    coverImage: "",
    bio: "Software Engineer | Tech Enthusiast",
  },
  {
    username: "jane_smith",
    fullName: "Jane Smith",
    email: "janesmith@example.com",
    password: "123456",
    followers: [],
    following: [],
    profileImage: "",
    coverImage: "",
    bio: "Designer | Creative Thinker",
  },
  {
    username: "alice_wonder",
    fullName: "Alice Wonderland",
    email: "alice@example.com",
    password: "123456",
    followers: [],
    following: [],
    profileImage: "",
    coverImage: "",
    bio: "Adventurer | Storyteller",
  },
  {
    username: "mike_ross",
    fullName: "Mike Ross",
    email: "mikeross@example.com",
    password: "123456",
    followers: [],
    following: [],
    profileImage: "",
    coverImage: "",
    bio: "Law Associate | Chess Lover",
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    await User.insertMany(seedUsers);
    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

// Call the function
seedDatabase();
