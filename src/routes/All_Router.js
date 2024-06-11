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
}).single("company_logo");

var api_user = require("../api/Auth/Users_api");
var Role = require("../controller/Roles");
var Dashboard = require("../controller/Dashboard");
var Auth = require("../controller/Auth");
var CheckLogin = require("../middleware/LoginCheck");
var api_worker = require("../api/Workers/Workers_Api");
var api_company = require("../api/Companies/Companies_Api");
var api_job = require("../api/Jobs/Jobs_Api");
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

  //=================Auth Router ===============================
  router.get("/", Auth.SignIn);
  router.post("/", Auth.SignIn);

  // ==============Role Router===========================
  router.post("/api/role/roleCrate", Role.CreateRole);

  //=================Dashboard Router =====================

  router.get("/Dashboard/index", CheckLogin.ycLogin, Dashboard.index);

  return app.use("/", router);
};

//==================Worker=========================
router.post("/api/workers/create/:user_id", api_worker.create_Workers); //Thêm hồ sơ NLĐ
router.put("/api/workers/edit/:user_id/:worker_id", api_worker.edit_Workers); //Sửa hồ sơ NLĐ
router.get(
  "/api/workers/getListWorkersByUserId/:user_id",
  api_worker.getListWorkersByUserId
); //Lấy danh sách hồ sơ theo User_id
router.delete(
  "/api/workers/delete/:user_id/:worker_id",
  api_worker.deleteWorker
); //Xóa hồ sơ bởi người tạo

//=======================Companies====================
router.post("/api/companies/create/:user_id", api_company.create_company); //thêm Doanh Nghiệp
router.put(
  "/api/companies/edit/:user_id/:company_id",
  uploader,
  api_company.edit_company
); // Sửa doanh nghiệp
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
router.delete("/api/jobs/delete/:company_id/:job_id", api_job.delete_job); //Xóa Job
module.exports = initWebRouter;