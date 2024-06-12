const cron = require('node-cron');

const User = require('../model/Users');


const deleteUnverifiedUsers = async () => {
    try {
        // Tìm và lưu thông tin người dùng chưa xác thực sau 10 phút
        const unverifiedUsers = await User.userModel.find({ verify: false, createdAt: { $lt: new Date(Date.now() - 1 * 60 * 1000) } });
        console.log(Date.now())
        // Nếu có người dùng bị xóa, log thông tin của họ
        if (unverifiedUsers != null && unverifiedUsers.length > 0) {
            console.log('Deleting unverified users older than 10 minutes:');
            unverifiedUsers.forEach(user => {
                console.log(`User: ${user.accout_name}, Email: ${user.email}`);
            });
        } else {
            console.log('No unverified users older than 10 minutes found.');
        }

        // Xóa người dùng chưa xác thực sau 10 phút
        await User.userModel.deleteMany({ verify: false, createdAt: { $lt: new Date(Date.now() - 1 * 60 * 1000) } });
    } catch (error) {
        console.error('Error while deleting unverified users:', error);
    }
};

// Cron job chạy mỗi phút để xử lý các trường hợp khác nhau
cron.schedule('* * * * *', async () => {
    // Xóa người dùng chưa xác thực sau 10 phút
    await deleteUnverifiedUsers();


});
