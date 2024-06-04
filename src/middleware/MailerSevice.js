const nodemailer = require('nodemailer');
const crypto = require('crypto');

const {MAILER} = require('../config/Mailer_Config');

var OtpServiceMD = require('../model/OTP_Sevice');
// Cấu hình transporter cho Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user:  MAILER.MAIL_USERNAME, // Thay bằng email của bạn
    pass: MAILER.MAIL_PASSSWORD  // Thay bằng mật khẩu của bạn
  }
});

// Hàm gửi OTP
async function sendOtp(email,type) {
  // Tạo OTP ngẫu nhiên
  const otp = crypto.randomBytes(3).toString('hex');

  // Lưu OTP vào MongoDB
  const newOtp = new OtpServiceMD.OtpServiceModel({ email:email, otp:otp,type:type });
  await newOtp.save();

  // Cấu hình email
  const mailOptions = {
    from: MAILER.MAIL_USERNAME,
    to: email,
    subject: 'Xác nhận đăng ký',
    text: `Mã OTP của bạn là: ${otp}`
  };
console.log(mailOptions);
console.log(MAILER.MAIL_USERNAME);

  // Gửi email
  let  check = await transporter.sendMail(mailOptions);
console.log(check);

}

// Hàm xác nhận OTP
async function verifyOtp(email, otp,type) {
  // Tìm OTP trong MongoDB
  console.log(email, otp)
  const foundOtp = await OtpServiceMD.OtpServiceModel.findOne({ email:email, otp:otp,type:type });

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
