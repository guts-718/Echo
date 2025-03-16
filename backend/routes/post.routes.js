import express from "express";
import { protectRoute } from "./../middlewares/protectRoute.js";
import {
  createPost,
  deletePost,
  commentOnPost,
  likeUnlikePost,
  getAllPost,
  getLikedPosts,
  getFollowingPost,
  getUserPosts,
} from "../controllers/post.controllers.js";
const router = express.Router();

router.get("/likes/:id", protectRoute, getLikedPosts);
router.get("/user/:username", protectRoute, getUserPosts);
router.get("/all", protectRoute, getAllPost);
router.get("/following", protectRoute, getFollowingPost);
router.post("/create", protectRoute, createPost);
router.post("/like/:id", protectRoute, likeUnlikePost);
router.post("/comments/:id", protectRoute, commentOnPost);
router.delete("/:id", protectRoute, deletePost);
export default router;
