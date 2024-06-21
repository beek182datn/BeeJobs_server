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

var api_user = require("../api/Auth/Users_api");
var Role = require("../controller/Roles");
var Dashboard = require("../controller/Dashboard");
var Auth = require("../controller/Auth");
var Companies = require("../controller/Companies");
var CheckLogin = require("../middleware/LoginCheck");
var api_worker = require("../api/Workers/Workers_Api");
var api_company = require("../api/Companies/Companies_Api");
var api_job = require("../api/Jobs/Jobs_Api");
var api_applyjob = require("../api/ApplyJobs/ApplyJobs_Api");
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
  // ==============auth api Router===========================
  router.get("/api/EditUser", api_user.api_EditUser);
  router.post("/api/EditUser", api_user.api_EditUser);

  //=================Auth Router ===============================
  router.get("/", Auth.SignIn);
  router.post("/", Auth.SignIn);

  // ==============Role Router===========================
  router.post("/api/role/roleCrate", Role.CreateRole);

  //=================Dashboard Router =====================

  router.get("/Dashboard/index", CheckLogin.ycLogin, Dashboard.index);


  //=================Companies Router =====================

  router.get("/Companies/index", CheckLogin.ycLogin, Companies.index);
  router.get("/compamies/active/:company_id", CheckLogin.ycLogin, Companies.acitve);



  return app.use("/", router);
};

//==================Worker=========================
router.post("/api/workers/create/:user_id", api_worker.create_Workers); //Thêm hồ sơ ứng tuyển của NLĐ
router.put("/api/workers/edit/:user_id/:worker_id", api_worker.edit_Workers); //Sửa hồ sơ ứng tuyển
router.get("/api/workers/getListWorkerByIdUser/:user_id", api_worker.getListWorkerByIdUser); //Lấy danh các hồ sơ ứng tuyển của NLĐ
router.get("/api/workers/getInforWorker/:worker_id", api_worker.getInforWorker); //Xem hồ sơ người lao động. Chờ cập nhật. Không sử dụng API này
router.delete("/api/workers/delete/:user_id/:worker_id", api_worker.deleteWorker); //Xóa hồ sơ bởi người tạo


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
router.delete("/api/jobs/delete/:company_id/:job_id", api_job.delete_job); //Xóa Job

//===================ApplyJobs================

router.post(
  "/api/applyJobs/create/:worker_id/:job_id",
  uploader.fields([{ name: "cv", maxCount: 1 }]),
  api_applyjob.create_applyjob
); // Ứng tuyển cv - Tạo applyjob

router.get("/api/applyJobs/getAllApplyJobs", api_applyjob.getAll_applyJob); // Lấy tất cả applyjobs  - Admin
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
module.exports = initWebRouter;
