const NotificationModel = require('../model/Notification');
const {firebase} = require('../firebase/index');
let io;

exports.setIo = (socketIo) => {
    io = socketIo;
    console.log("Socket.IO instance set for notifications");
};

exports.createNotification = async (userId, FormUser, message, type) => {
    try {
        const notification = new NotificationModel({
            userId,
            FormUser,
            message,
            type
        });
        await notification.save();

        if (io) {
          console.log('====================================');
          console.log("io đây",io);
          console.log('====================================');
          try {
            await io.to(userId.toString()).emitWithAck('newNotification', {
                title: "Thông báo mới!!!",
                message: notification.message,
                createdAt: notification.createdAt
            });
            console.log('Notification sent successfully');
        } catch (error) {
            console.error('Error sending notification:', error);
        }
        } else {
            console.warn("Socket.IO instance not set. Unable to emit notification.");
        }

        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        throw error;
    }
};
  
exports.getUnreadNotifications = async (userId) => {
    try {
        return await NotificationModel.find({ userId, isRead: false }).sort({ createdAt: -1 });
    } catch (error) {
        console.error("Error fetching unread notifications:", error);
        throw error;
    }
};

exports.getAllNotifications = async (userId, page = 1, limit = 10) => {
    try {
        const skip = (page - 1) * limit;
        const query = { userId };

        const [notifications, total] = await Promise.all([
            NotificationModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            NotificationModel.countDocuments(query)
        ]);

        return {
            notifications,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    } catch (error) {
        console.error("Error fetching all notifications:", error);
        throw error;
    }
};

exports.markAsRead = async (notificationId) => {
    try {
        await NotificationModel.findByIdAndUpdate(notificationId, { isRead: true });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        throw error;
    }
};

exports.sendNotifications = async (token) =>{

    try {
        await firebase.messaging().send({
            token:token,
            notification: {
                title: "Thông báo mới",
                body: "Thông báo mới từ BeeJobs",
               
            }
        })
    } catch (error) {
        console.log("Lỗi khi gửi thông báo :", error);
        
    }
  
}
