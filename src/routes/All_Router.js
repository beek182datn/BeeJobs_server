const express = require('express') 

var api_user = require("../api/Auth/Users_api");
var Role = require("../controller/Roles");
var Dashboard = require("../controller/Dashboard");
var Auth = require("../controller/Auth");
var CheckLogin = require("../middleware/LoginCheck");
var api_worker = require("../api/Workers/Workers_Api");
const router = express.Router();


/**
 * 
 * @param {*} app : express app 
 */
const initWebRouter = (app) =>{
  // ==============auth api Router===========================
  router.get('/api/login',api_user.api_Login);
  router.post('/api/login',api_user.api_Login);
  router.post('/api/signup',api_user.api_SignUp);
  router.post('/api/users',api_user.api_getInfo);
  router.post('/api/usersverifyotp',api_user.api_verifyOtp);



//=================Auth Router ===============================
router.get('/',Auth.SignIn);
router.post('/',Auth.SignIn);



  // ==============Role Router===========================
router.post('/api/role/roleCrate',Role.CreateRole);

//=================Dashboard Router =====================

router.get('/Dashboard/index',CheckLogin.ycLogin,Dashboard.index);

  return app.use("/",router);
}

//==================Worker=========================
router.post('/api/workers/create/:user_id',api_worker.create_Workers); //Thêm hồ sơ NLĐ
router.put('/api/workers/edit/:user_id/:worker_id', api_worker.edit_Workers); //Sửa hồ sơ NLĐ
// router.get('/api/workers/getListWorkersByUserId/:user_id',api_worker.getListWorkersByUserId); //Lấy danh sách hồ sơ theo User_id

module.exports = initWebRouter;