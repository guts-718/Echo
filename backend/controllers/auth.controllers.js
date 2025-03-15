import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/generateToken.js";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const pass = user?.password || "";
    const isPasswordCorrect = await bcrypt.compare(password, pass); // yaha await nhi diye to even wrong password pr login ho ja rha tha...

    if (!user || !isPasswordCorrect) {
      console.log("invalid credentials for login");
      return res.status(400).json({ error: "invalid username or password" });
    }
    generateTokenAndSetCookie(user._id, res);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImage: user.profileImage,
      coverImage: user.coverImage,
    });
  } catch (error) {
    console.log("Error while logging in ", error);
    res.status(400).json({ success: false, message: "could not login", error });
  }
};

export const signup = async (req, res) => {
  try {
    const { email, username, fullName, password } = req.body;
    if (!email || !password || !fullName || !username) {
      return res
        .status(400)
        .json({ success: false, message: "fill all the necessary fields" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "password should be more than 6 characters long" });
    }
    const emailRegex = /^[^@]+@[^@]+.[^@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "invalid email format" });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "username already exists" });
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      fullName,
      email,
      username,
      password: hashedPassword,
    });
    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();
      res.status(200).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profileImage: newUser.profileImage,
        coverImage: newUser.coverImage,
      });
    } else {
      console.log("server error");
      res
        .status(500)
        .json({ success: false, error: "server error could not sign up" });
    }
    await newUser.save();
  } catch (error) {
    console.log("Error while signing up", error);
    res
      .status(400)
      .json({ success: false, message: "could not signup", error: error });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "logged out successfully" });
  } catch (error) {
    console.log("error in logging out ", error);
    res
      .status(400)
      .json({ success: false, message: "could not logout", error: error });
  }
};

export const getME = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id }); // need to attach user._id to req.. middleware needed
  } catch (error) {
    console.log("could not get current user ", error);
    res.status(500).json({ success: false, error: error });
  }
};
