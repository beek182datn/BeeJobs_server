const { applyJobModel } = require("../../model/ApplyJobs");

exports.create_applyjob = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Phương thức không được hỗ trợ, hãy sử dụng: POST!",
      createdBy: "Hệ thống",
    });
  }

  try {
    // Kiểm tra sự tồn tại của người lao động và công việc
    const { worker_id, job_id } = req.body;

    // Kiểm tra xem người lao động đã ứng tuyển công việc này chưa
    const existingApplication = await applyJobModel.findOne({
      worker_id: worker_id,
      job_id: job_id,
    });

    if (existingApplication) {
      return res.status(400).json({
        message: "Người lao động đã ứng tuyển công việc này rồi!",
        createdBy: "Hệ thống",
      });
    }

    // Tạo đơn ứng tuyển mới
    const newApplyJob = new applyJobModel({
      worker_id: worker_id,
      job_id: job_id,
      status: req.body.status || "pending",
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
