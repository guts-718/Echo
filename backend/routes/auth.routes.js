import express from "express";
import {
  login,
  signup,
  logout,
  getME,
} from "../controllers/auth.controllers.js";
import { protectRoute } from "../middlewares/protectRoute.js";
const router = express.Router();

router.get("/me", protectRoute, getME);
router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);
export default router;
