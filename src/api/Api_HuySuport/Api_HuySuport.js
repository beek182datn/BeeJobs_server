var userMD = require("../../model/Users");
var roleMD = require("../../model/Roles");
const WorkerMD = require('../../model/Workers');
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

// Lấy thông tin người dùng dựa trên user_id
exports.getWorkerbyUserID = async (req, res) => {
  try {
    const user = await WorkerMD.findOne({ user_id: req.params.user_id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.checkUserId = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const user = await userMD.userModel.findOne({ _id: user_id });

    if (!user) {
      return res.status(200).json({
        registered: false,
        message: "User chưa đăng ký .",
        createdBy: "Hệ thống",
      });
    }

    return res.status(200).json({
      registered: true,
      data: user,
      message: "User đã đăng ký.",
      createdBy: "Hệ thống",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi: " + error.message,
      createdBy: "Hệ thống",
    });
  }
};
