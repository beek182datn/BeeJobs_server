const NotificationModel = require('../model/Notification');

let io;
exports.setIo = (socketIo) => {
    io = socketIo;
  };
exports.createNotification = async (userId,FormUser, message, type) => {
  const notification = new NotificationModel({
    userId,
    FormUser,
    message,
    type
  });
  await notification.save();

  // Gửi thông báo qua WebSocket
  io.to(userId.toString()).emit('newNotification', {
    message: notification.message,
    createdAt: notification.createdAt
  });
};
exports.getUnreadNotifications = async (userId) => {
  return await NotificationModel.find({ userId, isRead: false }).sort({ createdAt: -1 });
};

exports.getAllNotifications = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const notifications = await NotificationModel.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await NotificationModel.countDocuments({ userId });
  return { notifications, total, page, totalPages: Math.ceil(total / limit) };
};

exports.markAsRead = async (notificationId) => {
  await NotificationModel.findByIdAndUpdate(notificationId, { isRead: true });
};