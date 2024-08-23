const { log, debug } = require("winston");
var UsersMD  = require("../model/Users");
const _ = require("lodash");
var bcrypt = require("bcrypt");
var fs = require("fs");
const path = require("path");
const { StatusUser } = require("../config/Constans");
const NotificationHelper = require("../helper/NotificationHelper");


exports.index = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const skip = (page - 1) * limit;

    const query = search
      ? { $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]}
      : {};

    const totalUsers = await UsersMD.userModel.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    const lstUsers = await UsersMD.userModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.render('../views/Users/index.ejs', {
      list: lstUsers,
      currentPage: page,
      totalPages: totalPages,
      limit: limit,
      search: search
    });
  } catch (error) {
    next(error);
  }
};


exports.Add_user = async (req, res, next) => {
    if (req.method == "GET") {
        const tokenAuth = req.params.authorization;
        try {
         
    
          let tokencheck = await checkJWT(tokenAuth);
    
          if (tokencheck.isValid) {
            let objU = await userMD.userModel.findOne({
              _id: tokencheck.payload.sub,
            });
    
            objReturn.status = 200;
            objReturn.user_info = objU;
            objReturn.msg = "";
          } else {
            objReturn.status = 400;
            objReturn.msg = "Token không đúng";
          }
        } catch (error) {
          objReturn.status = 400;
          objReturn.msg = "Lỗi :" + error.message;
        }
      } else if (req.method == "POST") {
        const tokenAuth = req.params.authorization;

        console.log(req.body);
        try {
        
    
     
            let IMGAvata = "";
            if (req.files != null && req.files["avata_profile"]) {
              const IMGFile = req.files["avata_profile"][0];
              const newPathLogo = path.join("./public/uploads/", IMGFile.filename);
              fs.renameSync(IMGFile.path, newPathLogo);
              IMGAvata = "/uploads/" + IMGFile.filename;
            }
    
            var objU = new UsersMD.userModel();
    
            // Ánh xạ các trường từ req.body vào objU
            const objUMD = _.assign(objU, req.body);
            objUMD.avata = IMGAvata;
            await objUMD.save();

            await NotificationHelper.createNotification(
              res.locals.userInfo._id,
              res.locals.userInfo._id,// Giả sử bạn đã có middleware xác thực
              'Đã có người dùng được tạo mới',
              'Thông báo'
            );
           return res.redirect('/Users/index');
          
        } catch (error) {
          console.log(error);
        }
      }
    

};


exports.Detail = async (req, res) => {
    if(req.method == 'GET'){
    try {
      console.log("Đây");
       const user = await UsersMD.userModel.findById(req.params.user_id);
        if(user) {
            res.render('../views/Users/Detail.ejs',{user: user})
          } 
         
        
      } catch (error) {
        console.log(error);
      }
    }
};

exports.LockUser = async (req, res) => {
    const user = await UsersMD.userModel.findById(req.params.user_id);
    console.log(user);
    if(user){
      user.active = StatusUser.LOCK;
      await user.save();
      console.log("Đã khóa");
      res.redirect('/Users/index');
    }
};



exports.EditUser = async (req, res) => {
    if (req.method == "GET") {

      try {
      
  
        
       const user = await UsersMD.userModel.findById(req.params.user_id);
        if(user) {
            res.render('../views/Users/edit.ejs',{user: user})
          } 
         
        
      } catch (error) {
        console.log(error);
      }
    } else if (req.method == "POST") {
      
      try {
       
      
       
          let IMGAvata = "";
          
  
          var objU = await UsersMD.userModel.findOne({
            _id: req.params.user_id
          });
  
          // Ánh xạ các trường từ req.body vào objU
          const objUMD = _.assign(objU, req.body);
          IMGAvata= objUMD.avata;
          if (req.files != null && req.files["avata_profile"]) {
            const IMGFile = req.files["avata_profile"][0];
            const newPathLogo = path.join("./public/uploads/", IMGFile.filename);
            fs.renameSync(IMGFile.path, newPathLogo);
            IMGAvata = "/uploads/" + IMGFile.filename;
            objUMD.avata = IMGAvata;
          }
          await objUMD.save();
          return res.redirect('/Users/index');
        
      } catch (error) {
      console.log(error);
      }
    }
  
    
  };


