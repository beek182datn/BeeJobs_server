var userMD = require("../../model/User");
var roleMD = require("../../model/Role");
var userRoleMD = require("../../model/UserRole");

var {jwtMiddleware,createJWT} = require("../../middleware/JWT");


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

                    let objUserRole = await userRoleMD.UserRoleModel.findOne({IdUser: objU._id})
            if(objUserRole){
               let objRole = await roleMD.RoleModel.findOne({_id: objUserRole.IdRole})
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

            let objRole = await roleMD.RoleModel.findOne({Code: "ADMIN"})
            if(objRole){
                let objUserRole = new userRoleMD.UserRoleModel();

                objUserRole.IdUser = objU._id;
                objUserRole.IdRole = objRole._id;
            await objUserRole.save();

            }

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

    const [endcodedHeader, encodedPayload, tokensignature] = tokenAuth.split(".")
    const tokenData = `${endcodedHeader}.${encodedPayload}`
    const newsignature= createJWT(tokenData);
    console.log('Signature from token:', tokensignature);
    console.log('Newly generated signature:', newsignature);
    console.log('Signatures match:', newsignature === tokensignature);
    if (newsignature=== tokensignature) {
      const payload = JSON.parse(atob(encodedPayload));
      const user = await userMD.userModel.findOne({_id: payload.sub});
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
