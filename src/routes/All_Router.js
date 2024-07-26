const express = require("express");

var multer = require("multer");
var path = require("path");
// Cấu hình lưu trữ cho multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Thêm thời gian vào tên file để tránh trùng lặp
  },
});

// Bộ lọc file để chỉ chấp nhận các loại file cụ thể
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|pdf/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("File type not accepted"), false);
  }
};

// Cấu hình multer
const uploader = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, // Giới hạn kích thước file (5MB)
});

var chat = require("../api/AppFindJobs/Chat");
var appfindjobs = require("../api/AppFindJobs/AppFindJobsApi");
var api_user = require("../api/Auth/Users_api");
var Role = require("../controller/Roles");
var Dashboard = require("../controller/Dashboard");
var Auth = require("../controller/Auth");
var Companies = require("../controller/Companies");
var User = require("../controller/Users");
var Jobs = require("../controller/Jobs");
var CheckLogin = require("../middleware/LoginCheck");
var api_worker = require("../api/Workers/Workers_Api");
var api_company = require("../api/Companies/Companies_Api");
var api_job = require("../api/Jobs/Jobs_Api");
var api_applyjob = require("../api/ApplyJobs/ApplyJobs_Api");
var api_suportLong = require("../api/Api_SuportLong/Api_SuportLong"); //Dùng tạm thời để support Long demo với Imatech
var api_huysuport = require("../api/Api_HuySuport/Api_HuySuport"); //Dùng tạm thời để thêm các starts check
var api_getChat = require("../api/Get_Chat_Api/GetChat_Api");
const router = express.Router();

/**
 *
 * @param {*} app : express app
 */
const initWebRouter = (app) => {
  // ==============auth api Router===========================
  router.get("/api/login", api_user.api_Login);
  router.post("/api/login", api_user.api_Login);
  router.post("/api/signup", api_user.api_SignUp);
  router.post("/api/users", api_user.api_getInfo);
  router.post("/api/usersverifyotp", api_user.api_verifyOtp);
  router.post("/api/forgottpass", api_user.api_ForgotPasswords);
  router.post("/api/forgottpass2", api_huysuport.Huy_api_ForgotPasswords); // Huy demo
  router.get("/api/user/checkuser/:user_id", api_huysuport.checkUserId); // Huy demo
  router.post("/api/changepass", api_user.apiChangeForgotPasswords);
  router.post("/api/changepassword/:userId", api_user.api_ChangePassWord);

  // ==============auth api Router===========================
  router.get("/api/EditUser", api_user.api_EditUser);
  router.post("/api/EditUser", api_user.api_EditUser);

  //=================Auth Router ===============================
  router.get("/", Auth.SignIn);
  router.post("/", Auth.SignIn);
  router.get("/logout", Auth.logout);

  // ==============Role Router===========================
  router.post("/api/role/roleCrate", CheckLogin.ycLogin, Role.CreateRole);

  //=================Dashboard Router =====================

  router.get("/Dashboard/index", CheckLogin.ycLogin, Dashboard.index);

  //=================Tin tuyển dụng Router =====================

  router.get("/Jobs/index", CheckLogin.ycLogin, Jobs.index);

  router.get("/Jobs/Detail/:jobs_id", CheckLogin.ycLogin, Jobs.GetInfoJobs);
  router.get("/Jobs/lockJobs/:jobs_id", CheckLogin.ycLogin, Jobs.LockJobs);

  //=================Companies Router =====================

  router.get("/Companies/index", CheckLogin.ycLogin, Companies.index);
  router.get(
    "/Companies/lockcompani/:company_id",
    CheckLogin.ycLogin,
    Companies.LockCompanies
  );
  router.get(
    "/compamies/active/:company_id",
    CheckLogin.ycLogin,

    Companies.acitve
  );

  router.get(
    "/compamies/detail/:Idcompany",
    CheckLogin.ycLogin,
    Companies.GetInfoCompany
  );
  //=================Users Router =====================

  router.get("/Users/index", CheckLogin.ycLogin, User.index);
  router.post(
    "/Users/addUser",
    uploader.fields([{ name: "avata_profile", maxCount: 1 }]),
    User.Add_user
  );
  router.get("/Users/editUser/:user_id", CheckLogin.ycLogin, User.EditUser);
  router.post(
    "/Users/editUser/:user_id",
    uploader.fields([{ name: "avata_profile", maxCount: 1 }]),
    User.EditUser
  );

  router.get("/Users/detail/:user_id", CheckLogin.ycLogin, User.Detail);
  router.get("/Users/lockuser/:user_id", CheckLogin.ycLogin, User.LockUser);
  return app.use("/", router);
};

//==================Worker=========================
router.post(
  "/api/workers/create/:user_id",
  uploader.fields({ name: "worker_avatar", maxCount: 1 }),
  api_worker.create_Workers
); //Thêm hồ sơ ứng tuyển của NLĐ
router.put("/api/workers/edit/:user_id/:worker_id", api_worker.edit_Workers); //Sửa hồ sơ ứng tuyển
router.get(
  "/api/workers/getListWorkerByIdUser/:user_id",
  api_worker.getListWorkerByIdUser
); //Lấy danh các hồ sơ ứng tuyển của NLĐ
router.get("/api/workers/getInforWorker/:user_id", api_worker.getInforWorker); //Xem hồ sơ người lao động. Chờ cập nhật. Không sử dụng API này
router.delete(
  "/api/workers/delete/:user_id/:worker_id",
  api_worker.deleteWorker
); //Xóa hồ sơ bởi người tạo
router.get(
  "/api/applyJobs/checkApplyJobs/:worker_id/:job_id",
  api_suportLong.checkApplyJobs
); //Api tạm thời. Support Long demo với Imatech
router.get("/api/getwokerbyUserID/:user_id", api_huysuport.getWorkerbyUserID);

//=======================Companies====================
router.post(
  "/api/companies/create/:user_id",
  uploader.fields([
    { name: "company_logo", maxCount: 1 },
    { name: "company_certification", maxCount: 1 },
  ]),
  api_company.create_company
); //thêm Doanh Nghiệp
router.put(
  "/api/companies/edit/:user_id/:company_id",
  uploader.fields([
    { name: "company_logo", maxCount: 1 },
    { name: "company_certification", maxCount: 1 },
  ]),
  api_company.edit_company
); // Sửa doanh nghiệp

router.put(
  "/api/companies/editLogo/:user_id/:company_id",
  uploader.fields([{ name: "company_logo", maxCount: 1 }]),
  api_company.edit_company_logo
); // Sửa nguyên logo
router.get("/api/companies/getListCompany", api_company.getListCompany); //Lấy  danh sách doanh nghiệp

router.get(
  "/api/companies/getCompanyById/:company_id",
  api_company.getCompanyById
); // Lấy doanh nghiệp theo id

router.get("/api/companies/search", api_company.getCompanyByCompanyName); // tìm doanh nghiệp theo tên
router.delete(
  "/api/companies/delete/:user_id/:company_id",
  api_company.delete_company
); // Xóa doanh nghiệp
router.get(
  "/api/companies/checkCompany/:user_id",
  api_company.checkCompanyByUserId
);

//=================Jobs===================

router.post("/api/jobs/create/:company_id", api_job.createJob); // Tạo Job mới
router.put("/api/jobs/edit/:company_id/:job_id", api_job.editJob); // Cập nhật Job
router.get("/api/jobs/getListJobs", api_job.getListJobs); // Lấy danh sách tất cả công việc
router.get("/api/jobs/getJobById/:job_id", api_job.getJobById); // Lấy công việc theo id
router.get(
  "/api/jobs/getJobsByIdCompany/:company_id",
  api_job.getJobsByIdCompany
); //Lấy tất cả công việc của 1 DN
router.get("/api/jobs/getJobsBySalary", api_job.getJobsBySalary); //Tìm công việc theo mức lương
router.get("/api/jobs/getJobsByTitle", api_job.getJobsByTitle); //Tìm công việc theo tiêu đề == vị trí tuyển dụng
router.get("/api/jobs/getJobsByLocation", api_job.getJobsByLocation); //Tìm việc theo địa điểm doanh nghiệp
router.get("/api/jobs/getJobsByForm", api_job.getJobsByForm); //Tìm việc theo hình thức (Thực tập, ....)
router.get("/api/jobs/getJobsByFilters", api_job.getJobsByFilters); // Tìm việc theo bộ lọc
router.delete("/api/jobs/delete/:company_id/:job_id", api_job.delete_job); //Xóa Job
router.get(
  "/api/jobs/getJobsAppliedByCompanyId/:company_id",
  api_job.getJobsAppliedByCompanyId
);

router.get(
  "/api/jobs/getJobApplyDonedByCompanyId/:company_id",
  api_job.getJobApplyDonedByCompanyId
);
router.get(
  "/api/jobs/getDataJobApplyDonedByCompanyId/:company_id",
  api_job.getDataJobApplyDonedByCompanyId
);

//===================ApplyJobs================

router.post(
  "/api/applyJobs/create/:worker_id/:job_id",
  uploader.fields([{ name: "cv", maxCount: 1 }]),
  api_applyjob.create_applyjob
); // Ứng tuyển cv - Tạo applyjob

router.put(
  "/api/applyJobs/editApplyJobStatus/:applyJob_id",
  api_applyjob.editApplyJob
); // Thay đổi trạng thái của đơn ứng tuyển

router.get("/api/applyJobs/getAllApplyJobs", api_applyjob.getAll_applyJob); // Lấy tất cả applyjobs  - Admin

router.get(
  "/api/applyJobs/getApplyJobById/:applyjob_id",
  api_applyjob.getApplyJobById
);
router.get(
  "/api/applyJobs/getApylyJobsByIdWorker/:worker_id",
  api_applyjob.getApplyJobsByIdWorker
); // Lấy tất cả applyjob của NLD
router.get(
  "/api/applyJobs/getApylyJobsByIdJob/:job_id",
  api_applyjob.getApplyJobsByIdJob
); //lấy tất cả applyjob của job

router.get(
  "/api/applyJobs/getApylyJobsByIdCompany/:company_id",
  api_applyjob.getApplyJobsByCompanyId
); // lấy tất cả applỵob theo id công ty

router.get(
  "/api/applyJobs/getApplyJobsDoneByIdCompany/:company_id",
  api_applyjob.getApplyJobsDoneByCompanyId
);
router.get(
  "/api/applyJobs/getApplyJobsFalseByIdCompany/:company_id",
  api_applyjob.getApplyJobsFalseByCompanyId
);
router.get(
  "/api/applyJobs/getWorkerAppliedByCompanyId/:company_id",
  api_applyjob.getWorkerAppliedByCompanyId
);

//=================AppFindJobs Router =====================
router.post("/follow/:userId/:companyId", appfindjobs.folowCompany);
router.get("/follow/:userId/:companyId", appfindjobs.checkIsFolowing);
router.post("/unfollow/:userId/:companyId", appfindjobs.unFollowCompany);
router.get("/user/:userId", appfindjobs.getInfoUser);
router.post(
  "/workers/create/:user_id",
  uploader.fields([{ name: "worker_avatar", maxCount: 1 }]),
  appfindjobs.create_Workers
);
router.post(
  "/workers/update/:user_id",
  uploader.fields([{ name: "worker_avatar", maxCount: 1 }]),
  appfindjobs.update_Workers
);
router.get("/api/findcompanys/:userId", appfindjobs.getFollowedCompanies);
router.get("/api/appliedjobs/:userId", appfindjobs.getJobApplications);

//=================Chat Router =====================
router.get("/api/chat/chatroom/:senderId/:receiverId", chat.getChatRoomInfo);
router.get("/api/chat/getMessages/:senderId/:receiverId", chat.getMessages);
router.post("/api/chat/sendmessage/:senderId/:receiverId", chat.sendMessage);
router.post("/api/chat/checkchatroom//:senderId/:receiverId", chat.checkChatRoom);

//================ Get Chat By Đông ===================
router.get(
  "/api/chat/getChatroomByCompanyId/:companyId",
  api_getChat.getChatroomByCompanyId
);
router.get(
  "/api/chat/getChatroomByUserId/:userId",
  api_getChat.getChatroomByUserId
);
router.get(
  "/api/chat/getMessageByChatroomId/:chatRoomId",
  api_getChat.getMessageByChatroomId
);
router.post("/api/chat/sendMessage", api_getChat.sendMessage);
router.delete(
  "/api/chat/deleteMessage/:messageId/:userId",
  api_getChat.deleteMessage
);
router.delete(
  "/api/chat/deleteMessagesInChatroom/:chatRoomId",
  api_getChat.deleteMessagesInChatroom
);
router.post("/api/chat/createChatRoom", api_getChat.createChatRoom);

module.exports = initWebRouter;
