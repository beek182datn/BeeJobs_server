var Jobs = require('../model/Jobs');
var Companies = require('../model/Companies');
const { StatusUser } = require('../config/Constans');

exports.index = async (req,res) => {

    let lstjobs = await Jobs.jobModel.find();
    
    // Lấy thông tin công ty cho mỗi công việc
    for (let job of lstjobs) {
        let company = await Companies.companyModel.findOne({ _id: job.company_id });
       
        job.companyName = company ? company.company_name : 'Không xác định';
        if(company.company_name != null){
            console.log(company.company_name);
        }
        
    }

    console.log(lstjobs);
    res.render('../views/NewJob/index.ejs', { list: lstjobs });
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