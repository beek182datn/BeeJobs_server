const mongoose = require('mongoose');
const moment = require('moment-timezone');
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  FormUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: String,
  type: String, // Ví dụ: 'info', 'success', 'warning', 'error'
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, 
    require: true,
    get: function(date) {
      if (date) {
        return moment(date).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
      }
      return date;
    },
    set: function(date) {
      return moment.tz(date, 'Asia/Ho_Chi_Minh').toDate();
    }, default: Date.now }
});

const NotificationModel = mongoose.model('NotificationModel', notificationSchema);

module.exports = NotificationModel;