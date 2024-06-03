const nodemailer = require('nodemailer');
const crypto = require('crypto');

const { MAIL_MAILER, MAIL_USERNAME, MAIL_PASSSWORD } = require('../config/MailerConfig');

var OtpServiceMD = require('../model/OTPSevice');
// Cấu hình transporter cho Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user:  MAIL_USERNAME, // Thay bằng email của bạn
    pass: MAIL_PASSSWORD  // Thay bằng mật khẩu của bạn
  }
});

// Hàm gửi OTP
async function sendOtp(email) {
  // Tạo OTP ngẫu nhiên
  const otp = crypto.randomBytes(3).toString('hex');

  // Lưu OTP vào MongoDB
  const newOtp = new OtpServiceMD.OtpServiceModel({ email:email, otp:otp });
  await newOtp.save();

  // Cấu hình email
  const mailOptions = {
    from: MAIL_USERNAME,
    to: email,
    subject: 'Xác nhận đăng ký',
    text: `Mã OTP của bạn là: ${otp}`
  };
console.log(mailOptions);
  // Gửi email
  let  check = await transporter.sendMail(mailOptions);
console.log(check);

}

// Hàm xác nhận OTP
async function verifyOtp(email, otp) {
  // Tìm OTP trong MongoDB
  console.log(email, otp)
  const foundOtp = await OtpServiceMD.OtpServiceModel.findOne({ email:email, otp:otp });

  if (foundOtp) {
    // OTP hợp lệ
    await OtpServiceMD.OtpServiceModel.deleteOne({ _id: foundOtp._id }); // Xóa OTP sau khi xác thực
    return true;
  } else {
    // OTP không hợp lệ
    return false;
  }
}

module.exports = {
  sendOtp,
  verifyOtp
};
