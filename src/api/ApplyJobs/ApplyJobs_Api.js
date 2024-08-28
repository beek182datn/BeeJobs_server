const { applyJobModel } = require("../../model/ApplyJobs");
const { jobModel } = require("../../model/Jobs");
const WorkerMD = require("../../model/Workers");

const { createNotification } = require("../../helper/NotificationHelper");

const { userModel } = require("../../model/Users");
const { companyModel } = require("../../model/Companies");
const NotificationModel = require("../../model/Notification");

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
    let status_cv = "pending";
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
      fullname: req.body.fullname,
      phone_number: req.body.phone_number,
      intro_letter: req.body.intro_letter,
      cv: url_cv,
      status: status_cv,
      applied_at: new Date(),
    });

    // Lưu đơn ứng tuyển vào cơ sở dữ liệu
    await newApplyJob.save();

    var getIdCompany = await jobModel.findOne({ _id: job_id });

    var getUserId = await companyModel.findOne({
      _id: getIdCompany.company_id,
    });
    if (getUserId != null) {
      await createNotification(
        getUserId.user_id,
        worker_id,
        "Có hồ sơ ứng tuyển mới!!!",
        "UngTuyen"
      );
    }

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

    let message = "";
    // Tìm và cập nhật chỉ trường status
    const updatedApplyJob = await applyJobModel.findByIdAndUpdate(
      applyJobId,
      { status },
      { new: true }
    );
    const job = await jobModel.findById(updatedApplyJob.job_id);
    if (!job) {
      return res.status(404).json({
        message: "Công việc không tồn tại!",
        createdBy: "Hệ thống",
      });
    }

    const company = await companyModel.findById(job.company_id);
    if (!company) {
      return res.status(404).json({
        message: "Công ty không tồn tại!",
        createdBy: "Hệ thống",
      });
    }
    if (status === "Phù hợp" || status === "Chưa phù hợp") {
      message =
        "Nhà tuyển dụng đã đánh giá trạng thái ứng tuyển của bạn là: " + status;
    } else {
      message = "Nhà tuyển dụng đã " + status + " hồ sơ của bạn!";
    }
    await createNotification(
      updatedApplyJob.worker_id,
      company._id,
      message,
      "Ứng Tuyển",
      updatedApplyJob.job_id,
      updatedApplyJob._id
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

exports.getApplyJobById = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({
      message: "Phương thức không được hỗ trợ, hãy sử dụng: GET!",
      createdBy: "Hệ thống",
    });
  }

  try {
    const { applyjob_id } = req.params;

    const applyJob = await applyJobModel.findById(applyjob_id);

    if (!applyJob) {
      return res.status(404).json({
        message: "Không tìm thấy đơn ứng tuyển!",
        createdBy: "Hệ thống",
      });
    }

    return res.status(200).json({
      data: applyJob,
      message: "Lấy thông tin đơn ứng tuyển thành công!",
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

    if (!jobApplications) {
      return res.status(404).json({
        message: "ID job không hợp lệ",
        createdBy: "Hệ thống",
      });
    }

    return res.status(200).json({
      data: jobApplications || [],
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

    if (!jobs) {
      return res.status(404).json({
        message: "Không tìm thấy công việc nào cho công ty này!",
        createdBy: "Hệ thống",
      });
    }

    // Lấy danh sách job_id từ các công việc
    const jobIds = jobs.map((job) => job._id);

    // Tìm tất cả các đơn ứng tuyển với job_id trong danh sách jobIds
    const applications = await applyJobModel.find({ job_id: { $in: jobIds } });

    if (!applications) {
      return res.status(404).json({
        message: "Không tìm thấy đơn ứng tuyển nào cho công ty này!",
        createdBy: "Hệ thống",
      });
    }

    return res.status(200).json({
      data: applications || [],
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

exports.getApplyJobsDoneByCompanyId = async (req, res) => {
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

    if (!jobs) {
      return res.status(404).json({
        message: "Không tìm thấy công việc nào cho công ty này!",
        createdBy: "Hệ thống",
      });
    }

    // Lấy danh sách job_id từ các công việc
    const jobIds = jobs.map((job) => job._id);

    // Tìm tất cả các đơn ứng tuyển với job_id trong danh sách jobIds và có trạng thái là "Phù hợp"
    const applications = await applyJobModel.find({
      job_id: { $in: jobIds },
      status: "Phù hợp",
    });

    return res.status(200).json({
      data: applications || [],
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

exports.getApplyJobsDoneByJobId = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({
      message: "Phương thức không được hỗ trợ, hãy sử dụng: GET!",
      createdBy: "Hệ thống",
    });
  }

  try {
    const { job_id } = req.params;

    // Tìm tất cả các đơn ứng tuyển có job_id và có trạng thái là "Phù hợp"
    const applications = await applyJobModel.find({
      job_id: job_id,
      status: "Phù hợp",
    });

    return res.status(200).json({
      data: applications || [],
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

exports.getApplyJobsFalseByCompanyId = async (req, res) => {
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

    if (!jobs) {
      return res.status(404).json({
        message: "Không tìm thấy công việc nào cho công ty này!",
        createdBy: "Hệ thống",
      });
    }

    // Lấy danh sách job_id từ các công việc
    const jobIds = jobs.map((job) => job._id);

    // Tìm tất cả các đơn ứng tuyển với job_id trong danh sách jobIds và có trạng thái là "Phù hợp"
    const applications = await applyJobModel.find({
      job_id: { $in: jobIds },
      status: "Chưa phù hợp",
    });

    return res.status(200).json({
      data: applications || [],
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

exports.getWorkerAppliedByCompanyId = async (req, res) => {
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

    // if (!jobs) {
    //   return res.status(404).json({
    //     message: "Không tìm thấy công việc nào cho công ty này!",
    //     createdBy: "Hệ thống",
    //   });
    // }

    // Lấy danh sách job_id từ các công việc
    const jobIds = jobs.map((job) => job._id);

    // Tìm tất cả các worker đã ứng tuyển vào công ty này, không trùng lặp
    const workers = await applyJobModel.aggregate([
      { $match: { job_id: { $in: jobIds } } },
      {
        $group: {
          _id: "$worker_id",
          workerDetails: { $first: "$$ROOT" },
        },
      },
    ]);

    return res.status(200).json({
      data: workers || [],
      amount: workers.length,
      message: "Lấy tổng số worker đã ứng tuyển thành công!",
      createdBy: "Hệ thống",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi: " + error.message,
      createdBy: "Hệ thống",
    });
  }
};

exports.getDataWorkerAppliedByCompanyId = async (req, res) => {
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

    // Kiểm tra xem có công việc nào không

    // Lấy danh sách job_id từ các công việc
    const jobIds = jobs.map((job) => job._id);

    // Tìm tất cả các worker đã ứng tuyển vào các công việc này, không trùng lặp
    const workers = await applyJobModel.aggregate([
      { $match: { job_id: { $in: jobIds } } },
      {
        $group: {
          _id: "$worker_id", // Group by worker_id (ObjectId)
        },
      },
      {
        $addFields: {
          worker_id_as_string: { $toString: "$_id" },
        },
      },
      {
        $lookup: {
          from: "Workers", // Tên collection chứa thông tin worker
          localField: "worker_id_as_string",
          foreignField: "user_id",
          as: "workerDetails",
        },
      },
      {
        $unwind: {
          path: "$workerDetails",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: "$workerDetails._id",
          worker_name: "$workerDetails.worker_name",
          phone: "$workerDetails.phone",
          avatar: "$workerDetails.worker_avatar",
        },
      },
    ]);

    console.log("Workers Aggregation Results:", workers);

    return res.status(200).json({
      data: workers || [],
      message: "Lấy danh sách worker đã ứng tuyển thành công!",
      createdBy: "Hệ thống",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi: " + error.message,
      createdBy: "Hệ thống",
    });
  }
};
