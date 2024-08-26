const { log, debug } = require("winston");
var UsersMD  = require("../model/Users");
const _ = require("lodash");
var bcrypt = require("bcrypt");
var fs = require("fs");
const path = require("path");
const { StatusUser } = require("../config/Constans");
const NotificationHelper = require("../helper/NotificationHelper");
const {UserRoleModel} = require("../model/Users_Roles");
const {RoleModel} = require("../model/Roles");
const WorkerMD = require("../model/Workers");
const {companyModel} = require("../model/Companies");


exports.index = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const skip = (page - 1) * limit;

    const query = search
      ? { $or: [
          { accout_name: { $regex: search, $options: 'i' } }, // Correcting the field names based on schema
          { email: { $regex: search, $options: 'i' } }
        ]}
      : {};

    const totalUsers = await  UsersMD.userModel.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    const lstUsers = await UsersMD.userModel
      .find(query)
      .sort({ create_at: -1 }) // Using `create_at` as defined in your schema
      .skip(skip)
      .limit(limit)
      .lean();

    // Get the user IDs from the fetched users
    const userIds = lstUsers.map(user => user._id.toString());

    // Fetch UserRole documents for these users
    const userRoles = await UserRoleModel.find({ id_User: { $in: userIds } }).lean();

    // Extract unique role IDs
    const roleIds = [...new Set(userRoles.map(userRole => userRole.id_Role))];

    // Fetch roles from RoleModel
    const roles = await RoleModel.find({ _id: { $in: roleIds } }).lean();

    // Create a map of roles for easy lookup
    const rolesMap = roles.reduce((acc, role) => {
      acc[role._id.toString()] = role.Name;
      return acc;
    }, {});
    const workers = await WorkerMD.find({ user_id: { $in: userIds }  }).lean();
    const companies = await companyModel.find({ user_id: { $in: userIds },status: StatusUser.ACTIVE }).lean();
    const workersMap = workers.reduce((acc, worker) => {
      acc[worker._id.toString()] = worker._id.toString();
      return acc;
    }, {});
    const companiesMap = companies.reduce((acc, companie) => {
      acc[companie._id.toString()] = companie._id.toString();
      return acc;
    }, {});

    // Map roles to users
    const usersWithRoles = lstUsers.map(user => {
      const rolesForUser = userRoles
        .filter(userRole => userRole.id_User === user._id.toString())
        .map(userRole => rolesMap[userRole.id_Role]);
        const workerForUser = workers
        .filter(userWoker => userWoker.id_User === user._id.toString())
        .map(userWoker => workersMap[userWoker.user_id]);
        const compamiesForUser = companies
        .filter(userConpanis => userConpanis.id_User === user._id.toString())
        .map(userConpanis => companiesMap[userConpanis.user_id]);
        
      return {
        ...user,
        roles: rolesForUser,
        worker: workerForUser || null, // Include worker info if applicable
        company: compamiesForUser || null 
      };
    });
console.log(usersWithRoles)
    res.render('../views/Users/index.ejs', {
      list: usersWithRoles,
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

exports.OpenUser = async (req, res) => {
  const user = await UsersMD.userModel.findById(req.params.user_id);
  console.log(user);
  if(user){
    user.active = StatusUser.ACTIVE;
    await user.save();
    
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


