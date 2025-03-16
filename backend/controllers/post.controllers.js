import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import { v2 as cloudinary } from "cloudinary";
import Notification from "./../models/notification.model.js";
export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { image } = req.body;
    const userId = req.user._id.toString();
    const user = await User.findById(userId);

    if (!user) {
      console.log("user not found");
      return res
        .status(404)
        .json({ message: "user not found , so cant create post" });
    }
    if (!text && !image) {
      console.log("must give atleast text or image");
      return res.status(400).json({
        success: false,
        message: "atleast a text or a image needed",
        error: error.message,
      });
    }
    if (image) {
      const uploadedResponse = await cloudinary.uploader.upload(image);
      image = uploadedResponse.secure_url;
    }
    const newPost = new Post({
      user: userId,
      text,
      image,
    });
    await newPost.save();
    return res.status(200).json(newPost);
  } catch (error) {
    console.log("error in creating post: ", error);
    return res.status(401).json({
      success: false,
      message: "error in creating post",
      error: error.message,
    });
  }
};
// deletePost
export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    if (!postId) {
      console.log("such post does not exist");
      return res
        .status(400)
        .json({ success: false, message: "such a post does not exist" });
    }
    const post = await Post.findById(postId);
    if (req.user._id.toString() !== post.user.toString()) {
      console.log("you are not authorized to delete this post");
      return res.status(404).json({
        success: false,
        message: "you are not authorized to delete this post",
      });
    }
    if (post.image) {
      const imageId = post.image?.split["/"]?.pop()?.split(".")[0];
      if (imageId) await cloudinary.uploader.destroy(imageId);
    }
    await Post.findByIdAndDelete(postId);
    console.log("post deleted successfully");
    res
      .status(200)
      .json({ success: true, message: "post deleted successfully" });
  } catch (error) {
    console.log("could not delete the post");
    return res.status(500).json({
      success: false,
      message: "could not delete the post",
      error: error.message,
    });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    console.log("userid", req.user._id);
    if (!req.user._id) {
      console.log("user absent");
      return res.status(400).json({ message: "user not present" });
    }
    const { text } = req.body;
    const userId = req.user._id;
    const { id } = req.params;
    if (!id) {
      console.log("id absent");
      return res.status(400).json({ message: "id absent" });
    }
    if (!text) {
      console.log("Text field is required");
      return res
        .status(401)
        .json({ success: false, message: "Text field is required" });
    }
    const comment = {
      text,
      user: userId,
    };
    const post = await Post.findById(id);
    if (!post) {
      console.log("post not found");
      return res
        .status(401)
        .json({ message: "post not found", error: error.message });
    }

    //await Post.findByIdAndUpdate(id,{$push:{comments}});
    post.comments.push(comment);
    await post.save();
    console.log("comment added");
    return res
      .status(200)
      .json({ success: true, message: "comment added successfully" });
  } catch (error) {
    console.log("could not add comment: ", error);
    res.status(500).json({
      success: false,
      message: "could not add comment",
      error: error.message,
    });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      console.log("post does not exist");
      return res
        .status(404)
        .json({ success: false, message: "post does not exist" });
    }
    const isLiked = post.likes.includes(userId);
    if (isLiked) {
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
      post.likes.pull(userId);
      await post.save();
    } else {
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      post.likes.push(userId);
      await post.save();
      if (userId.toString() !== post.user.toString()) {
        const notification = new Notification({
          from: userId,
          to: post.user,
          type: "like",
        });
        await notification.save();
      }
    }
    console.log(`successfully ${isLiked ? "unliked" : "liked"} post`);
    res.status(200).json({
      success: true,
      message: `successfully ${isLiked ? "unliked" : "liked"} post`,
    });
  } catch (error) {
    console.log("failed to like / unlike");
    return res
      .status(500)
      .json({ success: false, message: "failed to like/ unlike" });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "user not found" });
    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    res.status(200).json(posts);
    console.log(posts);
  } catch (error) {
    console.log("could not fetch all posts");
    res.status(500).json({
      success: false,
      message: "could not fetch all posts",
      error: error.message,
    });
  }
};

export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });
    if (posts.length === 0) {
      console.log("no posts to show");
      res.status(200).json({ message: "no posts to show" });
    }
    console.log(posts);
    return res.status(200).json(posts);
  } catch (error) {
    console.log("could not fetch all posts");
    res.status(500).json({
      success: false,
      message: "could not fetch all posts",
      error: error.message,
    });
  }
};

export const getLikedPosts = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.log("user not found");
      return res.status(401).json({ message: "user not found" });
    }
    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(likedPosts);
  } catch (error) {
    console.log("could not fetch the liked posts");
    res.status(500).json({
      message: "Could not fetch the liked posts",
      error: error.message,
    });
  }
};

export const getFollowingPost = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "user not found" });
    const following = user.following;
    const feedPosts = await Post.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    console.log("following posts fetched", feedPosts);
    res.status(200).json(feedPosts);
  } catch (error) {
    console.log("unable to fetch the following posts");
    res.status(500).json({ success: false, error: error.message });
  }
};
