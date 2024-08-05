const { log } = require('winston');
const NotificationModel = require('../../model/Notification');

let io;

exports.setIo = (socketIo) => {
  io = socketIo;
};

exports.createNotification = async (req, res) => {
  try {
    const { userId, formUser, message, type } = req.body;
    
    const notification = new NotificationModel({
      userId,
      formUser,
      message,
      type
    });
    await notification.save();

    // Gửi thông báo qua WebSocket
    io.to(userId.toString()).emit('newNotification', {
      message: notification.message,
      createdAt: notification.createdAt
    });

    res.status(201).json({ 
      message: 'Notification created successfully',
      notification 
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
};

exports.getUnreadNotifications = async (req, res) => {
  try {
    console.log("zo")
    const { userId } = req.params;
    const unreadNotifications = await NotificationModel.find({ userId, isRead: false })
      .sort({ createdAt: -1 });

    res.json(unreadNotifications);
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    res.status(500).json({ error: 'Failed to fetch unread notifications' });
  }
};

exports.getAllNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const notifications = await NotificationModel.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await NotificationModel.countDocuments({ userId });

    res.json({
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching all notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const updatedNotification = await NotificationModel.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!updatedNotification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ 
      message: 'Notification marked as read',
      notification: updatedNotification 
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};