import Notification from "../models/Notification.js";
import Group from "../models/Group.js";

/**
 * Creates notifications for all group members except the sender,
 * and emits a socket event to each recipient.
 */
const createNotification = async (io, groupId, senderId, message, link) => {
  try {
    const group = await Group.findById(groupId);
    if (!group) return;

    const recipients = group.members.filter(
      (m) => m.toString() !== senderId.toString()
    );

    if (!recipients.length) return;

    const notifications = recipients.map((userId) => ({
      user: userId,
      message,
      link,
    }));

    const created = await Notification.insertMany(notifications);

    for (const notif of created) {
      io.to(notif.user.toString()).emit("notification:new", notif);
    }
  } catch (error) {
    console.error("Failed to create notifications:", error);
  }
};

export default createNotification;
