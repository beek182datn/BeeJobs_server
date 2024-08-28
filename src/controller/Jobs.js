var Jobs = require('../model/Jobs');
var Companies = require('../model/Companies');
const { StatusUser } = require('../config/Constans');
var {applyJobModel} = require("../model/ApplyJobs");
var { jobModel } = require("../model/Jobs");
var { companyModel } = require("../model/Companies");
var  WorkerMD = require("../model/Workers");


exports.index = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';

        const skip = (page - 1) * limit;

        const query = search
            ? { title: { $regex: search, $options: 'i' } }
            : {};

        const totalJobs = await jobModel.countDocuments(query);
        const totalPages = Math.ceil(totalJobs / limit);

        // Tìm các công việc cùng với thông tin công ty và số lượng ứng viên
        let lstjobs = await jobModel
            .find(query)
            .skip(skip)
            .sort({ _id: -1 })
            .limit(limit)
            .populate('company_id', 'company_name')
            .lean();

        // Lấy danh sách job_id từ kết quả lstjobs
        const jobIds = lstjobs.map(job => job._id);

        // Đếm số lượng ứng viên đã ứng tuyển cho mỗi job_id
        const applicationCounts = await applyJobModel.aggregate([
            { $match: { job_id: { $in: jobIds } } },
            {
                $group: {
                    _id: "$job_id",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Chuyển đổi kết quả đếm thành một object để dễ dàng truy xuất
        const applicationCountMap = applicationCounts.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        // Hàm định dạng ngày tháng theo kiểu dd/MM/yyyy
        const formatDate = (date) => {
            const d = new Date(date);
            const day = ("0" + d.getDate()).slice(-2);
            const month = ("0" + (d.getMonth() + 1)).slice(-2); // Tháng bắt đầu từ 0
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        };

        // Thêm số lượng ứng viên và định dạng ngày tháng vào danh sách công việc
        lstjobs = lstjobs.map(job => ({
            ...job,
            companyName: job.company_id ? job.company_id.company_name : 'Không xác định',
            applicationsCount: applicationCountMap[job._id] || 0,
            expires_at_formatted: formatDate(job.expires_at) // Thêm trường ngày giờ đã định dạng
        }));

        console.log(lstjobs);
        res.render('../views/NewJob/index.ejs', {
            list: lstjobs,
            currentPage: page,
            totalPages: totalPages,
            limit: limit,
            search: search
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Đã xảy ra lỗi server');
    }
};

exports.GetInfoJobs = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;

        // Tìm công việc dựa trên job_id
        const lstJobs = await Jobs.jobModel.findById(req.params.jobs_id);
        
        if (lstJobs) {
            // Đếm số lượng ứng viên đã ứng tuyển cho công việc
            const getCountAplyJob = await applyJobModel.find({ job_id: lstJobs._id });

            // Gán số lượng ứng viên cho lstJobs
            lstJobs.applicationsCount = getCountAplyJob.length || 0; 

            // Lấy danh sách worker_id từ getCountAplyJob
            const workerIds = getCountAplyJob.map(apply => apply.worker_id);
            console.log(workerIds)

            // Lấy danh sách thông tin người lao động từ WorkerMD
            const GetWorkerAplyjob = await WorkerMD
                .find({ user_id: { $in: workerIds } })
                .skip(skip)
                .limit(limit)
                .sort({ _id: -1 })
                .lean();
            console.log(GetWorkerAplyjob)
            // Render trang chi tiết công việc với thông tin công việc và danh sách ứng viên
            res.render('../views/NewJob/Detail.ejs', { 
                jobs: lstJobs, 
                workers: GetWorkerAplyjob,
                currentPage: page,
                limit: limit,
                totalPages: Math.ceil(workerIds.length / limit),
                search: search
            });
        } else {
            // Nếu không tìm thấy công việc, trả về lỗi hoặc trang không tìm thấy
            res.status(404).send('Không tìm thấy công việc.');
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Đã xảy ra lỗi server.');
    }
}

exports.LockJobs = async (req, res) => {
    const ObjJobs = await Jobs.jobModel.findById(req.params.jobs_id);
   
    if(ObjJobs){
        ObjJobs.status = StatusUser.LOCK;
      await ObjJobs.save();
     
      res.redirect('/Jobs/index');
    }
};