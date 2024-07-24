var userMD = require("../../model/Users");
var roleMD = require("../../model/Roles");
var userRoleMD = require("../../model/Users_Roles");
const _ = require("lodash");
var bcrypt = require("bcrypt");
var { jwtMiddleware, createJWT, checkJWT } = require("../../middleware/JWT");
var { sendOtp, verifyOtp } = require("../../middleware/MailerSevice");
const { MAIL_TYPE } = require("../../config/Mailer_Config");
const {
  hashPassword,
  checkPassword,
} = require("../../middleware/hashEveryone");

var objReturn = {
  status: 1,
  msg: " ",
  token: " ",
  user_info: " ",
  createBy: "Hệ Thống",
};
var user_info = {
  Role: "",
};

exports.Huy_api_ForgotPasswords = async (req, res) => {
    let objReturn = { status: 500, msg: "Có lỗi xảy ra" }; // Initialize response object
    
    if (req.method == "POST") {
      try {
        const { email } = req.body;
  
        // Check if the email exists in the database
        const checkEmail = await userMD.userModel.findOne({ email: email });
        
        if (checkEmail) {
          await sendOtp(email, MAIL_TYPE.OTP_FogotPassword);
          objReturn.status = 200;
          objReturn.msg = "Xác thực thành công";
        } else {
          // Handle case when email is not registered
          objReturn.status = 404;
          objReturn.msg = "Email chưa được đăng ký";
        }
      } catch (error) {
        console.log(error);
        objReturn.status = 500;
        objReturn.msg = "Có lỗi xảy ra trong quá trình xử lý";
      }
    }
  
    res.json(objReturn);
  };