const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  FormUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: String,
  type: String, // Ví dụ: 'info', 'success', 'warning', 'error'
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const NotificationModel = mongoose.model('NotificationModel', notificationSchema);

module.exports = NotificationModel;