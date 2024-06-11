var userMD = require("../../model/Users");
var roleMD = require("../../model/Roles");
var userRoleMD = require("../../model/Users_Roles");
var bcrypt = require('bcrypt');
var { jwtMiddleware, createJWT, checkJWT } = require("../../middleware/JWT");
var { sendOtp, verifyOtp } = require("../../middleware/MailerSevice");
const { MAIL_TYPE } = require("../../config/Mailer_Config");
const { hashPassword, checkPassword } = require("../../middleware/hashEveryone");

var objReturn = {
  status: 1,
  msg: " ",
  token: " ",
  user_info:" "
};
var user_info = {
  
  Role: "",
}



exports.api_Login = async (req, res, next) => {
  if (req.method == "POST") {
    const { passwd, username } = req.body;
    console.log(req.body);

    try {
      const objU = await userMD.userModel.findOne({
        $or: [{ accout_name: username }, { email: username }]
      });
      console.log(objU);

      if (objU !== null) {
        const isPasswordMatch = await bcrypt.compare(passwd, objU.hash_pass);
        if (isPasswordMatch) {
          const userInfo = {
            // ...objU._doc, // Sao chép tất cả thuộc tính của objU vào userInfo
            id_user : objU._id,
            Username: objU.accout_name,
            Role: null // Khởi tạo Role ban đầu là null
          };

          let objUserRole = await userRoleMD.UserRoleModel.findOne({ id_User: objU._id });
          if (objUserRole) {
            let objRole = await roleMD.RoleModel.findOne({ _id: objUserRole.id_Role });
            console.log(objRole);
            userInfo.Role = objRole.Code; // Gán giá trị Role vào userInfo
            req.Role = objRole.Code;
          }

          req.user = objU;
          jwtMiddleware(req, res, () => {
            objReturn.token = req.token;
          });

          objReturn.user_info = userInfo; // Gán userInfo vào objReturn
          console.log("Đăng Nhập vào tk:");
          objReturn.status = 200;
          objReturn.msg = "Đăng nhập thành công";
        } else {
          objReturn.msg = "Sai Mật Khẩu";
          objReturn.status = 400;
          console.log("Sai mật khẩu");
          console.log(objU);
        }
      } else {
        objReturn.msg = "Không có thông tin người dùng " ;
        objReturn.info_user = "";
        objReturn.status = 400;
      }
    } catch (error) {
      objReturn.msg = "Lỗi : " + error.message;
      console.log(error);
    }
  }

  res.json(objReturn);
};

exports.api_SignUp = async (req, res, next) => {
  console.log(req.body);
  console.log("Đây");
  if (req.method == "POST") {
    console.log(req.body.email);
    const { email, passwd, accout_name, type_role } = req.body;
    let objU = await userMD.userModel.findOne({
      $or: [{ accout_name: accout_name }, { email: email }]
    });
    //lưu CSDL
    if (email != null && passwd != null && accout_name != null) {
      if (objU != null) {
        objReturn.msg = "Tài Khoản này đã được đăng ký";
        objReturn.status = 400;
        console.log("Tài khoản trùng");
      } else {
        try {
          // Mã hóa mật khẩu bằng bcrypt
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(passwd, salt);

          let objU = new userMD.userModel();
          objU.accout_name = accout_name;
          objU.hash_pass = hashedPassword; // Lưu mật khẩu đã mã hóa vào trường hash_pass
          objU.email = email;
          objU.status = 1; // Người dùng đang kích hoạt

          await objU.save();

          let objRole = await roleMD.RoleModel.findOne({ Code: type_role });
          if (objRole) {
            let objUserRole = new userRoleMD.UserRoleModel();
            objUserRole.id_User = objU._id;
            objUserRole.id_Role = objRole._id;
            await objUserRole.save();
          }

          await sendOtp(objU.email, MAIL_TYPE.OTP_SignUp);
          console.log("Oke");
          console.log(objU);
          objReturn.msg = "Đăng Ký thành Công";
          objReturn.status = 0;
        } catch (error) {
          console.log(error);
        }
      }
    } else {
      console.log("Chưa dk đc");
    }
  }
  res.json(objReturn);
};


exports.api_getInfo = async (req, res, next) => {
  if (req.method == "POST") {
    const tokenAuth = req.body.authorization;

    try {
      if (!tokenAuth) {
        return res.status(401).json({ message: "Unauthorized" });

      }
      let tokencheck = await checkJWT(tokenAuth);

      if (!tokencheck.isValid) {
        // Token không hợp lệ hoặc hết hạn
        return res.status(401).json({ message: tokencheck.message });
      }
      if (tokencheck.isValid) {
        console.log(tokencheck);
        const user = await userMD.userModel.findOne({ _id: tokencheck.payload.sub });
        token.UserInfo = user;
        user_info.Role = tokencheck.payload.Role;
        objReturn.token = token;


        objReturn.msg = "Lấy ok";
      }


    } catch (error) {
      console.log(error.message);
    }
  }
  res.json(objReturn)
};

exports.api_verifyOtp = async (req, res, next) => {
  if (req.method == "POST") {
    const { email, otp, type } = req.body;

    if (type == MAIL_TYPE.OTP_SignUp) {
      let isValid = await verifyOtp(email, otp, MAIL_TYPE.OTP_SignUp);
      if (isValid) {
        objReturn.status = 200;
        objReturn.msg = "Xác thực thành công";

      } else {
        objReturn.status = 400;
        objReturn.msg = "Xác thực thất bại";

      }
      console.log(isValid)

    } else if (type == MAIL_TYPE.OTP_SignUp) {

      let isValid = await verifyOtp(email, otp, MAIL_TYPE.OTP_FogotPassword);
      if (isValid) {
        objReturn.status = 1;
        objReturn.msg = "Xác thực thành công";
   


       

      } else {
        objReturn.status = 400;
        objReturn.msg = "Xác thực thất bại";

      }

    }

//------g
  }
  res.json(objReturn)
}

exports.api_FogotPasswords = (req, res) => {
  if (req.method == 'POST') {
    try {
      const { email } = req.body;
    } catch (error) {
      console.log(error)
    }
  }
};