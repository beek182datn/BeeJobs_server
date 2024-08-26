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
  limits: { fileSize: 1024 * 1024 * 20 }, // Giới hạn kích thước file (5MB)
});

var chat = require("../api/AppFindJobs/Chat");
var appfindjobs = require("../api/AppFindJobs/AppFindJobsApi");
var api_user = require("../api/Auth/Users_api");
var Role = require("../controller/Roles");
var Dashboard = require("../controller/Dashboard");
var Auth = require("../controller/Auth");
var Companies = require("../controller/Companies");
var Chat = require("../controller/Chat");
var User = require("../controller/Users");
var Jobs = require("../controller/Jobs");
var CheckLogin = require("../middleware/LoginCheck");
var History_Trans = require("../controller/historytrans");
const chatController = require("../controller/Chat");
var api_worker = require("../api/Workers/Workers_Api");
var api_company = require("../api/Companies/Companies_Api");
var api_job = require("../api/Jobs/Jobs_Api");
var api_applyjob = require("../api/ApplyJobs/ApplyJobs_Api");
var api_suportLong = require("../api/Api_SuportLong/Api_SuportLong"); //Dùng tạm thời để support Long demo với Imatech
var api_huysuport = require("../api/Api_HuySuport/Api_HuySuport"); //Dùng tạm thời để thêm các starts check
var api_getChat = require("../api/Get_Chat_Api/GetChat_Api");
const notification_api = require("../api/Notifi/notifi");
var api_toUpAccount = require("../api/Api_ToUpAccount/To_Up_Account");
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

  router.get(
    "/Dashboard/getdatayearDN/:selectedYear",
    CheckLogin.ycLogin,
    Dashboard.getYearData
  );
  router.get(
    "/Dashboard/getJobDataByYear/:selectedYear",
    Dashboard.getJobDataByYear
  );
  router.get(
    "/Dashboard/getApplicationDataByYear/:selectedYear",
    Dashboard.getApplicationDataByYear
  );
  router.get(
    "/Dashboard/getMoneyDepositsByYear/:selectedYear",
    Dashboard.getMoneyDepositsByYear
  );
  router.get(
    "/Dashboard/getMoneyDepositsByDateRange/:startDate/:endDate",
    Dashboard.getMoneyDepositsByDateRange
  );

  //=================Tin tuyển dụng Router =====================

  router.get("/Jobs/index", CheckLogin.ycLogin, Jobs.index);

  router.get("/Jobs/Detail/:jobs_id", CheckLogin.ycLogin, Jobs.GetInfoJobs);
  router.get("/Jobs/lockJobs/:jobs_id", CheckLogin.ycLogin, Jobs.LockJobs);

  //=================Companies Router =====================

  router.get("/Companies/index", CheckLogin.ycLogin, Companies.index);
  router.get(
    "/compamies/lockcompani/:company_id",
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

  //=================HistotyTrans Router =====================
  router.get("/histotyTrans/index", CheckLogin.ycLogin, History_Trans.index);

  //=================Chat Router =====================

  // Route để lấy các phòng chat của admin
  router.get("/chatrooms", chatController.getChatroomsByAdminId);

  // Route để tạo phòng chat mới
  router.post("/createChatRoom", chatController.createChatRoom);

  // Route để tìm kiếm người dùng
  router.get("/searchUsers", chatController.searchUsers);

  // Route để lấy tất cả người dùng
  router.get("/allUsers", chatController.getAllUsers);

  // Route để lấy danh sách tin nhắn trong phòng chat
  router.get(
    "/chatrooms/:chatRoomId/messages",
    chatController.getMessagesByChatRoomId
  );

  // Route để gửi tin nhắn mới
  router.post("/chatrooms/:chatRoomId/messages", chatController.sendMessage);

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
router.get(
  "/api/chat/getChatroomByUserIdForWorker/:userId",
  api_huysuport.getChatroomByUserIdForWorker
);
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

router.post(
  "/api/companies/top_up_account/:company_id",
  api_company.top_up_account
);
router.post(
  "/api/companies/upgrade_to_premium/:company_id",
  api_company.upgrade_to_premium
);
router.post(
  "/api/companies/cancle_to_premium/:company_id",
  api_company.cancle_to_premium
);

//=================Jobs===================

router.post("/api/jobs/create/:company_id", api_job.createJob); // Tạo Job mới
router.put("/api/jobs/edit/:company_id/:job_id", api_job.editJob); // Cập nhật Job
router.put("/api/jobs/editstatus/:job_id", api_job.updateJobStatusToInactive);
router.get("/api/jobs/getListJobs", api_job.getListJobs); // Lấy danh sách tất cả công việc
router.get("/api/jobs/getJobById/:job_id", api_job.getJobById); // Lấy công việc theo id
router.get(
  "/api/jobs/getJobsByIdCompany/:company_id",
  api_job.getJobsByIdCompany
); //Lấy tất cả công việc của 1 DN
router.get(
  "/api/jobs/getJobsActiveByIdCompany/:company_id",
  api_job.getJobsActiveByCompanyId
);
router.get(
  "/api/jobs/getJobsInctiveByIdCompany/:company_id",
  api_job.getJobsInactiveByCompanyId
);

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
  "/api/jobs/getDataJobsAppliedByCompanyId/:company_id",
  api_job.getDataJobsAppliedByCompanyId
);

router.get(
  "/api/jobs/getJobApplyDonedByCompanyId/:company_id",
  api_job.getJobApplyDonedByCompanyId
);
router.get(
  "/api/jobs/getDataJobApplyDonedByCompanyId/:company_id",
  api_job.getDataJobApplyDonedByCompanyId
);
router.get("/api/jobs/searchWorkersByJob/:job_id", api_job.searchWorkersByJob);

router.get(
  "/api/jobs/getJobsWithSuitableApplications/:company_id",
  api_job.getJobsWithSuitableApplications
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
  "/api/applyJobs/getApplyJobsDoneByJobId/:job_id",
  api_applyjob.getApplyJobsDoneByJobId
);
router.get(
  "/api/applyJobs/getApplyJobsFalseByIdCompany/:company_id",
  api_applyjob.getApplyJobsFalseByCompanyId
);
router.get(
  "/api/applyJobs/getWorkerAppliedByCompanyId/:company_id",
  api_applyjob.getWorkerAppliedByCompanyId
);
router.get(
  "/api/applyJobs/getDataWorkerAppliedByCompanyId/:company_id",
  api_applyjob.getDataWorkerAppliedByCompanyId
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
router.get("/api/appliedjobs/:workerId", appfindjobs.getJobApplications);
router.get("/followjob/:userId/:jobId", appfindjobs.folowJob);
router.get("/checkfollowjob/:userId/:jobId", appfindjobs.checkIsFolowingJob);
router.get("/unfollowjob/:userId/:jobId", appfindjobs.unFollowjob);
router.get("/api/findjobs/:userId", appfindjobs.getFollowedJobs);
router.get(
  "/api/getapylyjobsbyIdworker/:worker_id",
  appfindjobs.getApplyJobsByIdWorker
);
router.get("/jobs/getJobById/:job_id", appfindjobs.getJobById);
router.get("/getlistjob", appfindjobs.getListJobs);
router.get("/jobs/getJobsBySalary", appfindjobs.getJobsBySalary); //Tìm công việc theo mức lương
router.get("/jobs/getJobsByTitle", appfindjobs.getJobsByTitle); //Tìm công việc theo tiêu đề == vị trí tuyển dụng
router.get("/jobs/getJobsByLocation", appfindjobs.getJobsByLocation); //Tìm việc theo địa điểm doanh nghiệp
router.get("/jobs/getJobsByForm", appfindjobs.getJobsByForm); //Tìm việc theo hình thức (Thực tập, ....)
router.get(
  "/jobs/getjobbycompanyid/:company_id",
  appfindjobs.getJobsByIdCompany
);
router.get("/jobs/getjobs", appfindjobs.getJobsFilterOption);
router.post(
  "/applyJobs/create/:worker_id/:job_id",
  uploader.fields([{ name: "cv", maxCount: 1 }]),
  appfindjobs.create_applyjob
);

//=================Chat Router =====================
router.get("/api/chat/chatroom/:senderId/:receiverId", chat.getChatRoomInfo);
router.get("/api/chat/getMessages/:senderId/:receiverId", chat.getMessages);
router.post("/api/chat/sendmessage/:senderId/:receiverId", chat.sendMessage);
router.get("/api/chat/checkchatroom/:senderId/:receiverId", chat.checkChatRoom);
router.get("/userinfo/:userId", chat.userInfo);

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

//=================Noti================================================================
router.post("/create", notification_api.createNotification);
router.get("/api/unread/:userId", notification_api.getUnreadNotifications);
router.get("/all/:userId", notification_api.getAllNotifications);
router.put("/markAsRead/:notificationId", notification_api.markAsRead);

router.get(
  "/api/notifi/getNotifiByCompanyId/:company_id",
  notification_api.getNotifiByCompanyId
);
router.get(
  "/api/notifi/getNotifiByWorkerId/:worker_id",
  notification_api.getNotifiByWorkerId
);
router.put(
  "/api/notifi/updateIsRead/:notification_id",
  notification_api.updateIsRead
);

//============== Payment ===============================
router.post("/api/payment/createPayment", api_toUpAccount.createPayment);
router.post("/api/payment/confirmPayment", api_toUpAccount.confirmPayment);
router.get(
  "/api/payment/getTransactionHistoryByCompanyId/:companyId",
  api_toUpAccount.getTransactionHistoryByCompanyId
);
router.post(
  "/api/payment/confirmPaymentSubtract",
  api_toUpAccount.confirmPaymentSubtract
);
router.delete(
  "/api/payment/deleteTransactionHistoryByCompanyId/:companyId",
  api_toUpAccount.deleteTransactionHistoryByCompanyId
);

module.exports = initWebRouter;
