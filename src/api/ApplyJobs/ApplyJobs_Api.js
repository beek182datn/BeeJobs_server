const { applyJobModel } = require("../../model/ApplyJobs");
const { jobModel } = require("../../model/Jobs");

var fs = require("fs");
const path = require("path");

exports.create_applyjob = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Phương thức không được hỗ trợ, hãy sử dụng: POST!",
      createdBy: "Hệ thống",
    });
  }

  try {
    // Kiểm tra sự tồn tại của người lao động và công việc
    const { worker_id, job_id } = req.params;

    let url_cv = "";
    if (req.files["cv"]) {
      const cvFile = req.files["cv"][0];
      const newPathLogo = path.join("./public/uploads/", cvFile.filename);
      fs.renameSync(cvFile.path, newPathLogo);
      url_cv = "/uploads/" + cvFile.filename;
    }

    // Tạo đơn ứng tuyển mới
    const newApplyJob = new applyJobModel({
      worker_id: worker_id,
      job_id: job_id,
      cv: url_cv,
      status: req.body.status,
      applied_at: new Date(),
    });

    // Lưu đơn ứng tuyển vào cơ sở dữ liệu
    await newApplyJob.save();

    return res.status(201).json({
      message: "Ứng tuyển công việc thành công!",
      createdBy: "Hệ thống",
      data: newApplyJob,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi: " + error.message,
      createdBy: "Hệ thống",
    });
  }
};

exports.editApplyJob = async (req, res) => {
  try {
    const applyJobId = req.params.applyJob_id;
    const { status } = req.body;

    // Tìm và cập nhật chỉ trường status
    const updatedApplyJob = await applyJobModel.findByIdAndUpdate(
      applyJobId,
      { status },
      { new: true }
    );

    if (!updatedApplyJob) {
      return res.status(404).json({
        message: "Công việc không tồn tại!",
        createdBy: "Hệ thống",
      });
    }

    return res.status(200).json({
      data: updatedApplyJob,
      message: "Update thành công",
      createdBy: "Hệ thống",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi: " + error.message,
      createdBy: "Hệ thống",
    });
  }
};

exports.getAll_applyJob = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({
      message: "Phương thức không được hỗ trợ, hãy sử dụng: GET!",
      createdBy: "Hệ thống",
    });
  }

  try {
    // Lấy danh sách tất cả các đơn ứng tuyển từ cơ sở dữ liệu
    const allApplyJobs = await applyJobModel.find();

    return res.status(200).json({
      data: allApplyJobs,
      message: "Lấy danh sách tất cả đơn ứng tuyển!",
      createdBy: "Hệ thống",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi: " + error.message,
      createdBy: "Hệ thống",
    });
  }
};

exports.getApplyJobsByIdWorker = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({
      message: "Phương thức không được hỗ trợ, hãy sử dụng: GET!",
      createdBy: "Hệ thống",
    });
  }

  try {
    const worker_id = req.params.worker_id;

    // Kiểm tra sự tồn tại của người lao động
    const workerApplications = await applyJobModel.find({ worker_id });

    if (!workerApplications || workerApplications.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy đơn ứng tuyển của người lao động này!",
        createdBy: "Hệ thống",
      });
    }

    return res.status(200).json({
      data: workerApplications,
      message: "Lấy danh sách đơn ứng tuyển thành công!",
      createdBy: "Hệ thống",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi: " + error.message,
      createdBy: "Hệ thống",
    });
  }
};

exports.getApplyJobsByIdJob = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({
      message: "Phương thức không được hỗ trợ, hãy sử dụng: GET!",
      createdBy: "Hệ thống",
    });
  }

  try {
    const job_id = req.params.job_id;

    const jobApplications = await applyJobModel.find({ job_id });

    if (!jobApplications || jobApplications.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy đơn ứng tuyển của công việc này!",
        createdBy: "Hệ thống",
      });
    }

    return res.status(200).json({
      data: jobApplications,
      message: "Lấy danh sách đơn ứng tuyển thành công!",
      createdBy: "Hệ thống",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi: " + error.message,
      createdBy: "Hệ thống",
    });
  }
};

exports.getApplyJobsByCompanyId = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({
      message: "Phương thức không được hỗ trợ, hãy sử dụng: GET!",
      createdBy: "Hệ thống",
    });
  }

  try {
    const { company_id } = req.params;

    // Tìm tất cả các công việc của công ty có company_id
    const jobs = await jobModel.find({ company_id: company_id });

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy công việc nào cho công ty này!",
        createdBy: "Hệ thống",
      });
    }

    // Lấy danh sách job_id từ các công việc
    const jobIds = jobs.map((job) => job._id);

    // Tìm tất cả các đơn ứng tuyển với job_id trong danh sách jobIds
    const applications = await applyJobModel.find({ job_id: { $in: jobIds } });

    if (!applications || applications.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy đơn ứng tuyển nào cho công ty này!",
        createdBy: "Hệ thống",
      });
    }

    return res.status(200).json({
      data: applications,
      message: "Lấy danh sách đơn ứng tuyển thành công!",
      createdBy: "Hệ thống",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi: " + error.message,
      createdBy: "Hệ thống",
    });
  }
};
