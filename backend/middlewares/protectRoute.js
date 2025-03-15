import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      console.log("no token.. not autorized");
      return res
        .status(400)
        .json({ success: false, message: "jwt token absent" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(400).json({ success: false, message: "wrong token" });
    }
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      console.log("user not found");
      res.status(500).json({ message: "user not found" });
    }
    req.user = user;
    console.log(req.user);
    res.send(req.user);
    next();
  } catch (error) {
    console.log("route not protected.. unauthorized user ");
    res
      .status(403)
      .json({ success: false, error: error, message: "unauthorized user" });
  }
};
