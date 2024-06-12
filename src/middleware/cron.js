const cron = require('node-cron');

const User = require('../model/Users');


const deleteUnverifiedUsers = async () => {
    try {
        // Tính toán thời gian hiện tại trừ đi 1 phút
        const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000);

        // Tìm và lưu thông tin người dùng chưa xác thực sau 1 phút
        const unverifiedUsers = await User.userModel.find({ verify: false, createdAt: { $lt: oneMinuteAgo } });

        // Nếu có người dùng bị xóa, log thông tin của họ
        if (unverifiedUsers.length > 0) {
            console.log('Deleting unverified users older than 1 minute:');
            unverifiedUsers.forEach(user => {
                console.log(`User: ${user.account_name}, Email: ${user.email}`);
            });

            // Xóa người dùng chưa xác thực sau 1 phút
            await User.userModel.deleteMany({ _id: { $in: unverifiedUsers.map(user => user._id) } });
        } else {
            console.log('No unverified users older than 1 minute found.');
        }
    } catch (error) {
        console.error('Error while deleting unverified users:', error);
    }
};


// Cron job chạy mỗi phút để xử lý các trường hợp khác nhau
cron.schedule('* * * * *', async () => {
    // Xóa người dùng chưa xác thực sau 10 phút
    await deleteUnverifiedUsers();


});
