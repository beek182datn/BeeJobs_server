const notificationHelper = require('../helper/NotificationHelper')

module.exports = async (req, res, next) => {
    if (res.locals.userInfo) {
      const unreadNotifications = await notificationHelper.getUnreadNotifications(res.locals.userInfo._id);
      res.locals.unreadNotifications = unreadNotifications;
      res.locals.unreadNotificationsCount = unreadNotifications.length;
      console.log(unreadNotifications);
    }
    next();
  }