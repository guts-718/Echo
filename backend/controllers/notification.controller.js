import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "username profileImage",
    });
    await Notification.updateMany({ to: userId }, { read: true });
    res.status(200).json(notifications);
  } catch (error) {
    console.log("could not fetch notification");
    return res.status(400).json({
      success: false,
      message: "could not fetch notification",
      error: error.message,
    });
  }
};

export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.deleteMany({ to: userId });
    res
      .status(200)
      .json({ success: true, message: "notifications deleted successfully" });
  } catch (error) {
    console.log("could not delete notification");
    return res.status(400).json({
      success: false,
      message: "could not delete notification",
      error: error.message,
    });
  }
};
