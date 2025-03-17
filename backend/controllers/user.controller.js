import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const getUserProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      console.log("such user does not exist");
      res.status(404).json({ success: false, message: "user does not exist" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log("failed to get user");
    res
      .status(400)
      .json({ message: "could not get the user", error: error.message });
  }
};

export const followUnfollowUser = async (req, res) => {
  console.log("function followunfollow user entered");
  try {
    const toFollowUserId = req.params.id;
    const toFollowUser = await User.findById(req.user._id);
    const currentUser = await User.findById(req.user._id);
    if (!toFollowUser || !currentUser)
      return res.status(400).json({ message: "user not found" });
    if (toFollowUserId === req.user._id.toString()) {
      //toString is necessary as we are using === and
      console.log("cant follow/ unfollow urself");
      return res
        .status(405)
        .json({ message: "cannot follow or unfollow yourself" });
    }

    const isFollowing = currentUser.following.includes(toFollowUserId);
    if (isFollowing) {
      // CURRENT USER IS TRYING TO UNFOLLOW
      // filer wont work has to do push or pull .. to modify the data in the database

      await User.findByIdAndUpdate(toFollowUserId, {
        $pull: { followers: req.user._id },
      });
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { following: toFollowUserId },
      });
      return res.status(200).json({ message: "user unfollowed successfully" });
    } else {
      // CURRENT USER IS TRYING TO FOLLOW
      await User.findByIdAndUpdate(toFollowUserId, {
        $push: { followers: req.user._id },
      });
      await User.findByIdAndUpdate(req.user._id, {
        $push: { following: toFollowUserId },
      });
      const newNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: toFollowUserId,
      });
      newNotification.save();
      return res.status(200).json({ message: "user followed successfully" });
    }
  } catch (error) {
    console.log("could not execute the follow or unfollow request: ", error);
    res.status(404).json({
      success: false,
      message: "could not do follow/unfollow",
      error: error.message,
    });
  }
};

export const getSuggestedUser = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get the list of users the current user follows
    const usersFollowed = await User.findById(userId).select("following");

    // Fetch random users, excluding the current user
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId }, // Exclude the current user
        },
      },
      { $sample: { size: 10 } }, // Corrected: added "$" to sample
    ]);

    // Check if usersFollowed exists to avoid errors
    const followingIds =
      usersFollowed?.following?.map((id) => id.toString()) || [];

    // Filter users that are not followed
    const filteredUsers = users.filter(
      (user) => !followingIds.includes(user._id.toString())
    );

    // Limit the suggested users to 4
    const suggestedUsers = filteredUsers.slice(0, 4);

    // Remove password field before sending response
    suggestedUsers.forEach((user) => {
      user.password = undefined;
    });

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("Error in suggested users:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const {
      fullName,
      username,
      email,
      currentPassword,
      newPassword,
      bio,
      link,
    } = req.body;
    let { profileImage, coverImage } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "user not found" });
    if ((!oldPassword && newPassword) || (oldPassword && !newPassword)) {
      console.log("please provide both the passwords");
    }
    if (newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        console.log("wrong password");
        return res.status(401).json({ message: "wrong password" });
      }
      if (newPassword.length < 6) {
        console.log("password should be atleast 6 characters long");
        return res
          .status(404)
          .json({ message: "password should be atleast 6 characters" });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      if (profileImage) {
        if (user.profileImage) {
          // https://res.cloudinary.com/dingitwq5/image/upload/v1741679668/grezqi58nwskx02mdtd8.jpg
          await cloudinary.uploader.destroy(
            user.profileImage.split("/").pop().split(".")[0]
          );
        }
        const uploadedResponse = await cloudinary.uploader.upload(profileImage);
        profileImage = uploadedResponse.secure_url;
      }

      if (coverImage) {
        if (user.coverImage) {
          // https://res.cloudinary.com/dingitwq5/image/upload/v1741679668/grezqi58nwskx02mdtd8.jpg
          await cloudinary.uploader.destroy(
            user.coverImage.split("/").pop().split(".")[0]
          );
        }
        const uploadedResponse = await cloudinary.uploader.upload(coverImage);
        coverImage = uploadedResponse.secure_url;
      }
      user.fullName = fullName || user.fullName;
      user.email = email || user.email;
      user.username = username || user.username;
      user.bio = bio || user.bio;
      user.link = link || user.link;
      user.profileImage = profileImage || user.profileImage;
      user.coverImage = coverImage || user.coverImage;
      user = await user.save();
      user.password = null;
      return res.status(200).json(user);
    }
  } catch (error) {
    console.log("error in updating the user profile ", error);
    res.status(401).json({
      success: false,
      message: "error in updateUserProfile function",
      error: error.message,
    });
  }
};
