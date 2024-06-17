const { jobModel } = require("../../model/Jobs");
const { companyModel } = require("../../model/Companies");

exports.createJob = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Phương thức không được hỗ trợ, hãy sử dụng: POST!",
      createdBy: "Hệ thống",
    });
  }

  try {
    // Kiểm tra sự tồn tại của công ty
    const company_id = req.params.company_id;
    const checkCompany = await companyModel.findById(company_id);
    if (!checkCompany) {
      return res.status(404).json({
        message: "Thông tin công ty không tồn tại!",
        createdBy: "Hệ thống",
      });
    }

    // Tạo công việc mới
    const newJob = new jobModel({
      company_id: req.params.company_id,
      title: req.body.title,
      desc: req.body.desc,
      form: req.body.form,
      number_of_recruitments: req.body.number_of_recruitments,
      requirements: req.body.requirements,
      salary: req.body.salary,
      benefits: req.body.benefits,
      location: req.body.location,
      deadline: req.body.deadline,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Lưu công việc vào cơ sở dữ liệu
    await newJob.save();

    return res.status(201).json({
      message: "Tạo công việc thành công!",
      createdBy: "Hệ thống",
      data: newJob,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi: " + error.message,
      createdBy: "Hệ thống",
    });
  }
};
exports.editJob = async (req, res) => {
  if (req.method !== "PUT") {
    return res.status(405).json({
      message: "Phương thức không được hỗ trợ, hãy sử dụng: PUT!",
      createdBy: "Hệ thống",
    });
  }

  try {
    // Lấy job_id và company_id từ params của request
    const job_id = req.params.job_id;
    const company_id = req.params.company_id;

    // Kiểm tra sự tồn tại của công việc
    const checkJob = await jobModel.findById(job_id);
    if (!checkJob) {
      return res.status(404).json({
        message: "Thông tin công việc không tồn tại!",
        createdBy: "Hệ thống",
      });
    }

    // Kiểm tra quyền sở hữu công việc bởi công ty
    if (checkJob.company_id.toString() !== company_id) {
      return res.status(403).json({
        message: "Thông tin công việc chỉ được chỉnh sửa bởi công ty sở hữu!",
        createdBy: "Hệ thống",
      });
    }

    // Cập nhật thông tin công việc
    const updateFields = {
      title: req.body.title,
      desc: req.body.desc,
      form: req.body.form,
      number_of_recruitments: req.body.number_of_recruitments,
      requirements: req.body.requirements,
      salary: req.body.salary,
      benefits: req.body.benefits,
      location: req.body.location,
      deadline: req.body.deadline,
      updated_at: new Date(),
    };

    // Loại bỏ các trường không được cung cấp
    Object.keys(updateFields).forEach((key) => {
      if (updateFields[key] === undefined) {
        delete updateFields[key];
      }
    });

    // Cập nhật công việc trong cơ sở dữ liệu
    const updatedJob = await jobModel.findByIdAndUpdate(job_id, updateFields, {
      new: true,
    });

    if (!updatedJob) {
      return res.status(500).json({
        message: "Không thể cập nhật thông tin công việc!",
        createdBy: "Hệ thống",
      });
    }

    return res.status(200).json({
      message: "Cập nhật thông tin công việc thành công!",
      createdBy: "Hệ thống",
      data: updatedJob,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi: " + error.message,
      createdBy: "Hệ thống",
    });
  }
};

exports.getListJobs = async (req, res) => {
  try {
    // Lấy tất cả các công việc
    const jobs = await jobModel.find({});

    const jobsWithCompanyLogo = await Promise.all(
      jobs.map(async (job) => {
        const company = await companyModel.findById(job.company_id);
        return {
          ...job.toObject(),
          company_logo: company ? company.company_logo : null,
        };
      })
    );

    return res.status(200).json({
      data: jobsWithCompanyLogo,
      message: "Danh sách các công việc",
      createdBy: "Hệ thống",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi: " + error.message,
      createdBy: "Hệ thống",
    });
  }
};
exports.getJobById = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({
      message: "Phương thức không được hỗ trợ, hãy sử dụng: GET!",
      createdBy: "Hệ thống",
    });
  }

  try {
    const job_id = req.params.job_id;

    const job = await jobModel.findById(job_id);
    if (!job) {
      return res.status(404).json({
        message: "Thông tin công việc không tồn tại!",
        createdBy: "Hệ thống",
      });
    }

    const company_id = job.company_id;
    const company = await companyModel.findById(company_id);
    if (!company) {
      return res.status(404).json({
        message: "Thông tin công ty không tồn tại!",
        createdBy: "Hệ thống",
      });
    }
    const jobWithCompanyLogo = {
      ...job.toObject(),
      company_logo: company.company_logo, // Thêm company_logo vào dữ liệu công việc
    };

    return res.status(200).json({
      data: jobWithCompanyLogo,
      message: "Thông tin công việc",
      createdBy: "Hệ thống",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi: " + error.message,
      createdBy: "Hệ thống",
    });
  }
};

exports.getJobsByIdCompany = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({
      message: "Phương thức không được hỗ trợ, hãy sử dụng: GET!",
      createdBy: "Hệ thống",
    });
  }

  try {
    const company_id = req.params.company_id;

    const checkCompany = await companyModel.findById(company_id);
    if (!checkCompany) {
      return res.status(404).json({
        message: "Thông tin công ty không tồn tại!",
        createdBy: "Hệ thống",
      });
    }
    const company_logo = checkCompany.company_logo;

    const jobs = await jobModel.find({ company_id });
    const jobsWithCompanyLogo = jobs.map((job) => ({
      ...job.toObject(),
      company_logo: company_logo, // Thêm company_logo vào từng công việc
    }));

    return res.status(200).json({
      data: jobsWithCompanyLogo,
      message: "Danh sách các công việc của công ty",
      createdBy: "Hệ thống",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi: " + error.message,
      createdBy: "Hệ thống",
    });
  }
};

exports.getJobsBySalary = async (req, res) => {
  try {
    const searchKeyword = req.query.keyword || "";

    const query = {};

    if (searchKeyword) {
      query.salary = { $regex: searchKeyword, $options: "i" };
    }
    const jobs = await jobModel.find(query);

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy công việc nào với mức lương này!",
        createdBy: "Hệ thống",
      });
    }

    const jobsWithCompanyLogo = await Promise.all(
      jobs.map(async (job) => {
        const company = await companyModel.findById(job.company_id);
        return {
          ...job.toObject(),
          company_logo: company ? company.company_logo : null,
        };
      })
    );

    return res.status(200).json({
      data: jobsWithCompanyLogo,
      message: "Danh sách công việc",
      createdBy: "Hệ thống",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi: " + error.message,
      createdBy: "Hệ thống",
    });
  }
};

exports.getJobsByTitle = async (req, res) => {
  try {
    const searchKeyword = req.query.keyword || "";

    const query = {};

    if (searchKeyword) {
      query.title = { $regex: searchKeyword, $options: "i" };
    }
    const jobs = await jobModel.find(query);

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy công việc với tên này!",
        createdBy: "Hệ thống",
      });
    }
    const jobsWithCompanyLogo = await Promise.all(
      jobs.map(async (job) => {
        const company = await companyModel.findById(job.company_id);
        return {
          ...job.toObject(),
          company_logo: company ? company.company_logo : null,
        };
      })
    );

    return res.status(200).json({
      data: jobsWithCompanyLogo,
      message: "Danh sách công việc",
      createdBy: "Hệ thống",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi: " + error.message,
      createdBy: "Hệ thống",
    });
  }
};

exports.getJobsByLocation = async (req, res) => {
  try {
    const searchKeyword = req.query.keyword || "";

    const query = {};

    if (searchKeyword) {
      query.location = { $regex: searchKeyword, $options: "i" };
    }
    const jobs = await jobModel.find(query);

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy công việc nào với địa điểm này!",
        createdBy: "Hệ thống",
      });
    }
    const jobsWithCompanyLogo = await Promise.all(
      jobs.map(async (job) => {
        const company = await companyModel.findById(job.company_id);
        return {
          ...job.toObject(),
          company_logo: company ? company.company_logo : null,
        };
      })
    );

    return res.status(200).json({
      data: jobsWithCompanyLogo,
      message: "Danh sách công việc",
      createdBy: "Hệ thống",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi: " + error.message,
      createdBy: "Hệ thống",
    });
  }
};

exports.getJobsByForm = async (req, res) => {
  try {
    const searchKeyword = req.query.keyword || "";

    const query = {};

    if (searchKeyword) {
      query.form = { $regex: searchKeyword, $options: "i" };
    }
    const jobs = await jobModel.find(query);

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy công việc nào với hình thức này!",
        createdBy: "Hệ thống",
      });
    }
    const jobsWithCompanyLogo = await Promise.all(
      jobs.map(async (job) => {
        const company = await companyModel.findById(job.company_id);
        return {
          ...job.toObject(),
          company_logo: company ? company.company_logo : null,
        };
      })
    );

    return res.status(200).json({
      data: jobsWithCompanyLogo,
      message: "Danh sách công việc",
      createdBy: "Hệ thống",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi: " + error.message,
      createdBy: "Hệ thống",
    });
  }
};

exports.delete_job = async (req, res) => {
  if (req.method !== "DELETE") {
    return res.status(405).json({
      message: "Phương thức không được hỗ trợ, hãy sử dụng: DELETE!",
      createdBy: "Hệ thống",
    });
  }

  try {
    const job_id = req.params.job_id;
    const company_id = req.params.company_id;

    const job = await jobModel.findById(job_id);
    if (!job) {
      return res.status(404).json({
        message: "Thông tin công việc không tồn tại!",
        createdBy: "Hệ thống",
      });
    }

    if (job.company_id.toString() !== company_id) {
      return res.status(403).json({
        message: "Thông tin công việc chỉ được xoá bởi công ty sở hữu!",
        createdBy: "Hệ thống",
      });
    }

    await jobModel.findByIdAndDelete(job_id);

    return res.status(200).json({
      message: "Xoá công việc thành công!",
      createdBy: "Hệ thống",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi: " + error.message,
      createdBy: "Hệ thống",
    });
  }
};
