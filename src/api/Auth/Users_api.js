var userMD = require("../../model/Users");
var roleMD = require("../../model/Roles");
var userRoleMD = require("../../model/Users_Roles");

var {jwtMiddleware,createJWT,checkJWT} = require("../../middleware/JWT");
var { sendOtp,verifyOtp} = require("../../middleware/MailerSevice");
const { MAIL_TYPE } = require("../../config/Mailer_Config");

var objReturn = {
    status: 1,
    msg: " ",
    token: " ",
  };
var token = {
  UserInfo : "",
  Role : "",
}
exports.api_Login = async (req,res,next) => {
    if (req.method == "POST"){
        const { passwd,username} = req.body;
    console.log(req.body);
    const hashPassGen = btoa(passwd)
    console.log(hashPassGen);
        try {
            

            let objU = await userMD.userModel.findOne({
              $or: [{ accout_name: username }, { email: username }]
          });
            console.log(objU);
            if (objU !== null) {
            
                if (objU.hash_pass == hashPassGen) {
                 
                    token.UserInfo = objU

                    let objUserRole = await userRoleMD.UserRoleModel.findOne({id_User: objU._id})
                    console.log(objUserRole);
            if(objUserRole){
               let objRole = await roleMD.RoleModel.findOne({_id: objUserRole.id_Role})
              console.log(objRole);
                token.Role = objRole.Name;
                req.Role = objRole.Code;
            } 

            req.user = objU;

            // Gọi jwtMiddleware để tạo JWT
            jwtMiddleware(req, res, () => {
                // Gửi token về cho client
                objReturn.token = req.token;
            });
                  console.log("Đăng Nhập vào tk:" );
                  objReturn.status = 0;
                  objReturn.msg = "Đăng nhập thành công" ;
                  
                } else {
                  objReturn.msg = "Sai Mật Khẩu";
                  objReturn.status = 1;
                  console.log("Sai mật khẩu" );
                  console.log(objU);
                }
              } else {
                objReturn.msg =
                  "Không có thông tin người dùng " +
                  accout_name;
                objReturn.info_user = "";
                objReturn.status = 1;
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
      const {email,passwd,accout_name} = req.body;
    
      let objU = await userMD.userModel.findOne({
        $or: [{ accout_name: accout_name }, { email: email }]
    });
  
      //lưu CSDL
  
      if (
        email != null &&
        passwd != null &&
        accout_name != null
      ) {
        if (objU != null) {
          objReturn.msg = "Tài Khoản này đã được đăng ký";
          objReturn.status = 3;
          console.log("Tài khoản trùng");
        } else {
          try {

            const hash_password =btoa(passwd)

            let objU = new userMD.userModel();
            objU.accout_name = accout_name;
       
            objU.hash_pass = hash_password;
            objU.email = email;
            objU.status = 1; // Người dùng đang kích hoạt
            


  
            await objU.save();

            let objRole = await roleMD.RoleModel.findOne({Code: " "})
            if(objRole){
                let objUserRole = new userRoleMD.UserRoleModel();

                objUserRole.id_User = objU._id;
                objUserRole.id_Role = objRole._id;
            await objUserRole.save();

            }
            await sendOtp(objU.email,MAIL_TYPE.OTP_SignUp);
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


exports.api_getInfo =  async (req,res,next)=> {
if(req.method == "POST"){
  const tokenAuth = req.body.authorization;
 
  try {
    if(!tokenAuth){
      return res.status(401).json({message: "Unauthorized"});

    }

    let tokencheck =  await checkJWT(tokenAuth);
    if (tokencheck) {
   console.log(tokencheck);
      const user = await userMD.userModel.findOne({_id: tokencheck.sub});
      token.UserInfo = user;
      objReturn.token = token;
      
     
      objReturn.msg = "Lấy ok";
    }
    
   
  } catch (error) {
    console.log(error.message);
  }
}
res.json(objReturn)
};

exports.api_verifyOtp = async (req,res,next)=> {
  if(req.method == "POST"){
    const {email,otp, type} = req.body;

    if(type == MAIL_TYPE.OTP_SignUp){
    let isValid = await verifyOtp(email, otp,MAIL_TYPE.OTP_SignUp);
    if (isValid) {
      objReturn.status = 1;
      objReturn.msg= "Xác thực thành công";
     
    }else {
      objReturn.status = 1;
      objReturn.msg= "Xác thực thất bại";
     
    }
    console.log(isValid)

  }else if(type == MAIL_TYPE.OTP_SignUp){

let isValid = await verifyOtp(email, otp,MAIL_TYPE.OTP_FogotPassword);
    if (isValid) {
      return res.json()


      objReturn.status = 1;
      objReturn.msg= "Xác thực thành công";
     
    }else {
      objReturn.status = 1;
      objReturn.msg= "Xác thực thất bại";
     
    }

  }
    

  }
  res.json(objReturn)
}

exports.api_FogotPasswords = (req,res) => {
if (req.method == 'POST') {
  try {
    const {email} = req.body;
  } catch (error) {
    console.log(error)
  }
}
};
