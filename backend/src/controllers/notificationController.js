import Notification from "../models/Notification.js";

export const getMyNotifications = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const notifications = await Notification.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json(notifications);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const markNotificationAsRead = async (req, res) => {
  const { id } = req.params;

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        userId: req.user._id,
      },
      {
        isRead: true,
      },
      {
        new: true,
      }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.status(200).json(notification);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    await Notification.updateMany(
      {
        userId: req.user._id,
        isRead: false,
      },
      {
        isRead: true,
      }
    );

    return res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
