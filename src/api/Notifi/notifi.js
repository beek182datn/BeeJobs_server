const { log } = require("winston");
const NotificationModel = require("../../model/Notification");

let io;

exports.setIo = (socketIo) => {
  io = socketIo;
};

exports.createNotification = async (req, res) => {
  try {
    const { userId, FromUser, message, type } = req.body;

    const notification = new NotificationModel({
      userId,
      FromUser,
      message,
      type,
    });
    await notification.save();

    // Gửi thông báo qua WebSocket
    io.to(userId.toString()).emit("newNotification", {
      message: notification.message,
      createdAt: notification.createdAt,
    });

    res.status(201).json({
      message: "Notification created successfully",
      notification,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ error: "Failed to create notification" });
  }
};

exports.getUnreadNotifications = async (req, res) => {
  try {
    console.log("zo");
    const { userId } = req.params;
    const unreadNotifications = await NotificationModel.find({
      userId,
      isRead: false,
    }).sort({ createdAt: -1 });

    res.json(unreadNotifications);
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    res.status(500).json({ error: "Failed to fetch unread notifications" });
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
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching all notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
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
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({
      message: "Notification marked as read",
      notification: updatedNotification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
};

exports.createNotifi = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Phương thức không được hỗ trợ, hãy sử dụng: POST!",
      createdBy: "Hệ thống",
    });
  }

  try {
    const { userId, FromUser, message, type, job_id, applyJob_id } = req.body;

    // Kiểm tra sự tồn tại của userId và FromUser (nếu cần thiết)
    // Ví dụ: kiểm tra nếu userId hoặc FromUser không tồn tại
    // const user = await UserModel.findById(userId);
    // const fromUser = await UserModel.findById(FromUser);
    // if (!user || !fromUser) {
    //   return res.status(404).json({
    //     message: 'Thông tin người dùng không tồn tại!',
    //     createdBy: 'Hệ thống',
    //   });
    // }

    // Tạo thông báo mới
    const newNotification = new NotificationModel({
      userId,
      FromUser,
      message,
      type,
      job_id,
      applyJob_id,
    });

    // Lưu thông báo vào cơ sở dữ liệu
    await newNotification.save();

    // Gửi thông báo qua WebSocket
    io.to(userId.toString()).emit("newNotification", {
      message: newNotification.message,
      createdAt: newNotification.createdAt,
    });

    return res.status(201).json({
      message: "Tạo thông báo thành công!",
      createdBy: "Hệ thống",
      data: newNotification,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi: " + error.message,
      createdBy: "Hệ thống",
    });
  }
};

exports.getNotifiByCompanyId = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({
      message: "Phương thức không được hỗ trợ, hãy sử dụng: GET!",
      createdBy: "Hệ thống",
    });
  }

  try {
    // Lấy company_id từ query params
    const { company_id } = req.params;

    if (!company_id) {
      return res.status(400).json({
        message: "Thiếu tham số company_id!",
        createdBy: "Hệ thống",
      });
    }

    // Tìm tất cả các thông báo có userId là company_id
    const notifications = await NotificationModel.find({
      userId: company_id,
    })
      .sort({ createdAt: -1 })
      .exec();

    return res.status(200).json({
      message: "Lấy thông báo thành công!",
      createdBy: "Hệ thống",
      data: notifications || [],
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi: " + error.message,
      createdBy: "Hệ thống",
    });
  }
};

exports.getNotifiByWorkerId = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({
      message: "Phương thức không được hỗ trợ, hãy sử dụng: GET!",
      createdBy: "Hệ thống",
    });
  }

  try {
    // Lấy company_id từ query params
    const { worker_id } = req.params;

    if (!worker_id) {
      return res.status(400).json({
        message: "Thiếu tham số worker_id!",
        createdBy: "Hệ thống",
      });
    }
    const notifications = await NotificationModel.find({
      userId: worker_id,
    })
      .sort({ createdAt: -1 })
      .exec();

    return res.status(200).json({
      message: "Lấy thông báo thành công!",
      createdBy: "Hệ thống",
      data: notifications || [],
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi: " + error.message,
      createdBy: "Hệ thống",
    });
  }
};

exports.updateIsRead = async (req, res) => {
  if (req.method !== "PUT") {
    return res.status(405).json({
      message: "Phương thức không được hỗ trợ, hãy sử dụng: PUT!",
      createdBy: "Hệ thống",
    });
  }

  try {
    const { notification_id } = req.params;

    if (!notification_id) {
      return res.status(400).json({
        message: "Thiếu tham số notification_id!",
        createdBy: "Hệ thống",
      });
    }

    // Cập nhật trường isRead thành true
    const updatedNotification = await NotificationModel.findByIdAndUpdate(
      notification_id,
      { isRead: true },
      { new: true }
    );

    if (!updatedNotification) {
      return res.status(404).json({
        message: "Thông báo không tồn tại!",
        createdBy: "Hệ thống",
      });
    }

    return res.status(200).json({
      message: "Cập nhật trạng thái isRead thành công!",
      createdBy: "Hệ thống",
      data: updatedNotification,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi: " + error.message,
      createdBy: "Hệ thống",
    });
  }
};
