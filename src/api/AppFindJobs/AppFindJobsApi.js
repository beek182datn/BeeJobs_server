const { companyModel } = require('../../model/Companies');
const { FolowerCompany } = require('../../model/FolowerCompany');
const { userModel } = require('../../model/Users');
const WorkerMD = require('../../model/Workers');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { applyJobModel } = require('../../model/ApplyJobs');
const { JobFollows } = require('../../model/JobFollow');
const { jobModel } = require('../../model/Jobs');

exports.folowCompany = async (req, res) => {
    try {
        const userId = req.params.userId;
        const companyId = req.params.companyId;
        let data = await FolowerCompany.findOne({ userId });
        if (!data) {
            // Nếu người dùng không tồn tại, tạo mới
            data = new FolowerCompany({
                userId,
                companyId: [companyId]
            });
        } else {
            // Nếu người dùng đã tồn tại, thêm companyId vào mảng companyId
            if (!data.companyId.includes(companyId)) {
                data.companyId.push(companyId);
            }
        }
        await data.save();
        res.status(200).send(data);
    } catch (error) {
        console.log(error);
    }
}

exports.checkIsFolowing = async (req, res) => {
    try {
        const userId = req.params.userId;
        const companyId = req.params.companyId;
        const data = await FolowerCompany.findOne({ userId });

        if (data && data.companyId.includes(companyId)) {
            res.status(200).send({ isFollowing: true });
        } else {
            res.status(200).send({ isFollowing: false });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}

exports.unFollowCompany = async (req, res) => {
    try {
        const userId = req.params.userId;
        const companyId = req.params.companyId;
        let data = await FolowerCompany.findOne({ userId });

        if (data) {
            // Nếu người dùng tồn tại, loại bỏ companyId khỏi mảng companyId
            data.companyId = data.companyId.filter(id => id !== companyId);
            await data.save();
            res.status(200).send(data);
        } else {
            // Nếu người dùng không tồn tại, trả về lỗi
            res.status(404).send({ error: 'User not found' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}

exports.getFollowedCompanies = async (req, res) => {
    try {
        const userId = req.params.userId;
        const data = await FolowerCompany.findOne({ userId });

        if (!data) {
            return res.status(200).json({
                data: [],
                message: "Không có dữ liệu: " + [],
                createdBy: "Hệ thống",
            });
        }

        const companyIds = data.companyId;

        // Tìm tất cả các công ty theo companyId
        const companies = await companyModel.find({
            _id: { $in: companyIds },
            status: 'ACTIVE'
        });

        if (!companies) {
            return res.status(500).json({
                data: [],
                message: "Không có dữ liệu: " + [],
                createdBy: "Hệ thống",
            });
        }

        res.status(200).send(companies);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Đã xảy ra lỗi." });
    }
}

exports.getInfoUser = async (req, res) => {
    try {
        let userId = req.params.userId;

        const user = await userModel.findOne({ _id: userId });
        res.status(200).send({ user, 'message': 'Lấy thông tin thành công' });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}


exports.create_Workers = async (req, res) => {
    if (req.method === "POST") {
        try {
            let user_id = req.params.user_id;
            let url_avatar = "http://beejobs.io.vn:14307/uploads/company_logo_outline.jpg"; // Đường dẫn ảnh đại diện mặc định
            console.log(JSON.stringify(req.body))
            console.log(JSON.stringify(req.files["worker_avatar"][0].filename))
            // Xử lý file ảnh đại diện của worker nếu có
            if (req.files["worker_avatar"]) {
                const logoFile = req.files["worker_avatar"][0];

                // Kiểm tra kích thước file (đơn vị: byte)
                const maxSizeInBytes = 1024 * 1024 * 1.5; // 1.5 MB
                if (logoFile.size > maxSizeInBytes) {
                    return res.status(400).json({ message: "File quá lớn. Vui lòng chọn file dưới 1.5MB." });
                }

                const newPathAvatar = path.join("./public/uploads/", logoFile.filename);
                fs.renameSync(logoFile.path, newPathAvatar); // Di chuyển file đến thư mục public
                url_avatar = "/uploads/" + logoFile.filename;
            }

            // Tạo mới đối tượng worker
            let worker = new WorkerMD({
                user_id: user_id,
                worker_name: req.body.worker_name,
                worker_avatar: url_avatar,
                phone: req.body.phone,
                email: req.body.email,
                major: req.body.major,
                experience: req.body.experience,
                address: req.body.address
            });

            // Lưu worker vào cơ sở dữ liệu
            await worker.save();

            // Phản hồi lại client với thông tin worker mới tạo
            return res.status(200).json({
                data: worker,
                message: "Tạo worker thành công",
                createdBy: "Hệ thống",
            });
        } catch (error) {
            console.error("Error saving worker:", error);
            return res.status(500).json({
                message: "Failed: " + error.message,
                createdBy: "Hệ thống",
            });
        }
    } else {
        return res.status(405).json({
            message: "Phương thức không được hỗ trợ, hãy sử dụng: POST",
            createdBy: "Hệ thống",
        });
    }
};

exports.update_Workers = async (req, res) => {
    if (req.method === "POST") {
        try {
            let user_id = req.params.user_id;

            // Tìm đối tượng worker theo user_id
            let worker = await WorkerMD.findOne({ user_id: user_id });
            if (!worker) {
                return res.status(404).json({
                    message: "Worker không tồn tại",
                    createdBy: "Hệ thống",
                });
            }

            // Xử lý file ảnh đại diện của worker nếu có
            if (req.files && req.files["worker_avatar"]) {
                const logoFile = req.files["worker_avatar"][0];

                // Kiểm tra kích thước file (đơn vị: byte)
                const maxSizeInBytes = 1024 * 1024 * 1.5; // 1.5 MB
                if (logoFile.size > maxSizeInBytes) {
                    return res.status(400).json({ message: "File quá lớn. Vui lòng chọn file dưới 1.5MB." });
                }

                const newPathAvatar = path.join("./public/uploads/", logoFile.filename);
                fs.renameSync(logoFile.path, newPathAvatar); // Di chuyển file đến thư mục public
                worker.worker_avatar = "/uploads/" + logoFile.filename;
            }

            // Cập nhật thông tin worker
            worker.worker_name = req.body.worker_name || worker.worker_name;
            worker.phone = req.body.phone || worker.phone;
            worker.email = req.body.email || worker.email;
            worker.major = req.body.major || worker.major;
            worker.experience = req.body.experience || worker.experience;
            worker.address = req.body.address || worker.address;


            // Lưu các thay đổi vào cơ sở dữ liệu
            await worker.save();

            // Phản hồi lại client với thông tin worker đã cập nhật
            return res.status(200).json({
                data: worker,
                message: "Cập nhật worker thành công",
                updatedBy: "Hệ thống",
            });
        } catch (error) {
            console.error("Error updating worker:", error);
            return res.status(500).json({
                message: "Failed: " + error.message,
                updatedBy: "Hệ thống",
            });
        }
    } else {
        return res.status(405).json({
            message: "Phương thức không được hỗ trợ, hãy sử dụng: PUT",
            updatedBy: "Hệ thống",
        });
    }
};

// exports.getJobApplications = async (req, res) => {
//     try {
//         const { userId } = req.params; // Giả sử bạn có userId trong params

//         // Lấy thời gian hiện tại
//         const now = moment();

//         // Tính thời gian cho 1 tuần và 30 ngày trước
//         const oneWeekAgo = now.subtract(7, 'days').toDate();
//         const thirtyDaysAgo = now.subtract(30, 'days').toDate();

//         // Truy vấn ứng tuyển trong 1 tuần
//         const appliedjobsLastWeek = await applyJobModel.find({
//             worker_id: userId,
//             applied_at: { $gte: oneWeekAgo }
//         });

//         // Truy vấn ứng tuyển trong 30 ngày
//         const appliedjobsLast30Days = await applyJobModel.find({
//             worker_id: userId,
//             applied_at: { $gte: thirtyDaysAgo }
//         });

//         // Truy vấn tất cả ứng tuyển
//         const allAppliedjobs = await applyJobModel.find({ worker_id: userId });

//         res.status(200).send({
//             appliedjobsLastWeek,
//             appliedjobsLast30Days,
//             allAppliedjobs
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).send({ message: "Đã xảy ra lỗi." });
//     }
// }

exports.getJobApplications = async (req, res) => {
    try {
        const { workerId } = req.params;

        const now = moment();
        const oneWeekAgo = now.subtract(7, 'days').toDate();
        const thirtyDaysAgo = now.subtract(30, 'days').toDate();

        // Truy vấn ứng tuyển trong 1 tuần, sắp xếp theo thời gian giảm dần
        const appliedjobsLastWeek = await applyJobModel.find({
            worker_id: workerId,
            applied_at: { $gte: oneWeekAgo }
        })
        .populate('worker_id')
        .populate('job_id')
        .sort({ applied_at: -1 }); // Sắp xếp theo thời gian giảm dần

        // Truy vấn ứng tuyển trong 30 ngày, sắp xếp theo thời gian giảm dần
        const appliedjobsLast30Days = await applyJobModel.find({
            worker_id: workerId,
            applied_at: { $gte: thirtyDaysAgo }
        })
        .populate('worker_id')
        .populate('job_id')
        .sort({ applied_at: -1 }); // Sắp xếp theo thời gian giảm dần

        // Truy vấn tất cả ứng tuyển, sắp xếp theo thời gian giảm dần
        const allAppliedjobs = await applyJobModel.find({ worker_id: workerId })
            .populate('job_id')
            .sort({ applied_at: -1 }); // Sắp xếp theo thời gian giảm dần

        // Lọc các công việc đã ứng tuyển còn tồn tại trong bảng job
        const validAppliedJobsLastWeek = appliedjobsLastWeek.filter(job => job.job_id);
        const validAppliedJobsLast30Days = appliedjobsLast30Days.filter(job => job.job_id);
        const validAllAppliedJobs = allAppliedjobs.filter(job => job.job_id);

        res.status(200).send({
            appliedjobsLastWeek: validAppliedJobsLastWeek,
            appliedjobsLast30Days: validAppliedJobsLast30Days,
            allAppliedjobs: validAllAppliedJobs
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Đã xảy ra lỗi." });
    }
}


exports.folowJob = async (req, res) => {
    try {
        const userId = req.params.userId;
        const jobId = req.params.jobId;
        let data = await JobFollows.findOne({ userId });
        if (!data) {
            // Nếu người dùng không tồn tại, tạo mới
            data = new JobFollows({
                userId,
                jobsId: [jobId]
            });
        } else {
            // Nếu người dùng đã tồn tại, thêm companyId vào mảng companyId
            if (!data.jobsId.includes(jobId)) {
                data.jobsId.push(jobId);
            }
        }
        await data.save();
        res.status(200).send(data);
    } catch (error) {
        console.log(error);
    }
}

exports.unFollowjob = async (req, res) => {
    try {
        const userId = req.params.userId;
        const jobId = req.params.jobId;
        let data = await JobFollows.findOne({ userId });

        if (data) {
            // Nếu người dùng tồn tại, loại bỏ companyId khỏi mảng companyId
            data.jobsId = data.jobsId.filter(id => id !== jobId);
            await data.save();
            res.status(200).send(data);
        } else {
            // Nếu người dùng không tồn tại, trả về lỗi
            res.status(404).send({ error: 'User not found' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}

exports.checkIsFolowingJob = async (req, res) => {
    try {
        const userId = req.params.userId;
        const jobId = req.params.jobId;
        const data = await JobFollows.findOne({ userId });

        if (data && data.jobsId.includes(jobId)) {
            res.status(200).send({ isFollowing: true });
        } else {
            res.status(200).send({ isFollowing: false });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}

exports.getFollowedJobs = async (req, res) => {
    try {
        const userId = req.params.userId;
        const data = await JobFollows.findOne({ userId });

        if (!data) {
            return res.status(200).json({
                data: [],
                message: "Không có dữ liệu: " + [],
                createdBy: "Hệ thống",
            });
        }

        const jobsId = data.jobsId;

        // Tìm tất cả các công ty theo companyId
        const jobs = await jobModel.find({
            _id: { $in: jobsId },
            status: 'ACTIVE'
        }
        );

        if (!jobs) {
            return res.status(200).json({
                data: [],
                message: "Không có dữ liệu: " + [],
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
            message: "Danh sách các công việc",
            createdBy: "Hệ thống",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Lỗi: " + error.message,
            createdBy: "Hệ thống",
        });
    }
}

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
            return res.status(200).json({
                data: [],
                message: "Không tìm thấy đơn ứng tuyển của người lao động này!",
                createdBy: "Long",
            });
        }

        return res.status(200).json({
            data: workerApplications,
            message: "Lấy danh sách đơn ứng tuyển thành công!",
            createdBy: "Hệ thống",
        });
    } catch (error) {
        return res.status(500).json({
            data: [],
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
                data: null,
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

exports.getListJobs = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1; // Trang hiện tại
      const limit = parseInt(req.query.limit) || 10; // Số lượng công việc mỗi trang
      const skip = (page - 1) * limit; // Số lượng công việc cần bỏ qua
  
      // Lấy công việc với phân trang
      const jobs = await jobModel.find({}).sort({created_at: 1}).skip(skip).limit(limit);
  
      const jobsWithCompanyLogo = await Promise.all(
        jobs.map(async (job) => {
          const company = await companyModel.findById(job.company_id);
          return {
            ...job.toObject(),
            company_logo: company ? company.company_logo : null,
          };
        })
      );
  
      // Lấy tổng số công việc để tính toán tổng số trang
      const totalJobs = await jobModel.countDocuments({});
      const totalPages = Math.ceil(totalJobs / limit);
  
      return res.status(200).json({
        data: jobsWithCompanyLogo,
        totalPages, // Tổng số trang
        currentPage: page, // Trang hiện tại
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
  