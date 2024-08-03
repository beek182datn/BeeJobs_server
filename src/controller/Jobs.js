var Jobs = require('../model/Jobs');
var Companies = require('../model/Companies');
const { StatusUser } = require('../config/Constans');

exports.index = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';

        const skip = (page - 1) * limit;

        const query = search
            ? { title: { $regex: search, $options: 'i' } }
            : {};

        const totalJobs = await Jobs.jobModel.countDocuments(query);
        const totalPages = Math.ceil(totalJobs / limit);

        let lstjobs = await Jobs.jobModel.find(query).skip(skip).limit(limit);

        // Lấy thông tin công ty cho mỗi công việc
        for (let job of lstjobs) {
            let company = await Companies.companyModel.findOne({ _id: job.company_id });
            job.companyName = company ? company.company_name : 'Không xác định';
        }

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
}


exports.GetInfoJobs = async (req, res, next) => {
    try {
        const lstJobs = await Jobs.jobModel.findById(req.params.jobs_id);
        if(lstJobs){
            res.render('../views/NewJob/Detail.ejs', {jobs: lstJobs});
        }
    } catch (error) {
        console.log(error);
    }
}
exports.LockJobs = async (req, res) => {
    const ObjJobs = await Jobs.jobModel.findById(req.params.jobs_id);
   
    if(ObjJobs){
        ObjJobs.status = StatusUser.LOCK;
      await ObjJobs.save();
     
      res.redirect('/NewJob/index');
    }
};