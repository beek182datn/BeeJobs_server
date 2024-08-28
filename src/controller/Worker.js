var CompaniesMD = require("../model/Companies");
const msg = " ";
var StatusUser = require("../../src/config/Constans");
var {historyTransModel} = require("../model/History_Trans");
var {applyJobModel} = require("../model/ApplyJobs");
var WorkerMD = require("../model/Workers");
var {jobModel} = require("../model/Jobs");


exports.index = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const skip = (page - 1) * limit;

    const query = search
      ? { worker_name: { $regex: search, $options: 'i' } }
      : {};

    const totalWorker = await WorkerMD.countDocuments(query);
    const totalPages = Math.ceil(totalWorker / limit);

    const lstWorker = await WorkerMD
      .find(query)
      .skip(skip)
      .sort({ _id: -1 })
      .limit(limit)
      .lean();

    res.render("../views/Worker/index.ejs", {
      list: lstWorker,
      currentPage: page,
      totalPages: totalPages,
      limit: limit,
      search: search
    });
  } catch (error) {
    next(error);
  }
};

// exports.GetInfoWoker = async (req, res, next) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const search = req.query.search || '';
//     const skip = (page - 1) * limit;


//     const Worker = await WorkerMD.findById(
//       req.params.IdWoker
//     );
//     if (Worker) {
//       const query = { worker_id: Worker.user_id};
      
//       const totalAplyJobs = await applyJobModel.countDocuments(query);
//       const totalPages = Math.ceil(totalAplyJobs / limit);
     
//       const GetAplyJobs =  await applyJobModel
//       .find(query)
//       .skip(skip)
//       .limit(limit)
//       .sort({ _id: -1 })
//       .lean();
//       res.render("../views/Worker/Detail.ejs", { woker: Worker,lstAplyJobs: GetAplyJobs, currentPage: page,
//         totalPages: totalPages,
//         limit: limit,
//         search: search});
//     }
//   } catch (error) {
//     console.log(error);
//   }
// };


exports.GetInfoWorker = async (req, res, next) => {
  try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
      const skip = (page - 1) * limit;

      // Tìm thông tin người lao động
      const Worker = await WorkerMD.findById(req.params.IdWoker).lean();

      if (Worker) {
          const query = { worker_id: Worker.user_id };

          // Đếm số lượng công việc đã ứng tuyển của người lao động
          const totalAplyJobs = await applyJobModel.countDocuments(query);
          const totalPages = Math.ceil(totalAplyJobs / limit);

          // Lấy danh sách các công việc ứng tuyển
          const GetAplyJobs = await applyJobModel
              .find(query)
              .skip(skip)
              .limit(limit)
              .sort({ _id: -1 })
              .lean();

          // Lấy danh sách job_id từ các công việc ứng tuyển
          const jobIds = GetAplyJobs.map(apply => apply.job_id);

          // Tìm các công việc tương ứng
          const jobs = await jobModel
              .find({ _id: { $in: jobIds } })
              .select('_id title') // Chọn trường cần thiết
              .lean();

          // Tạo một map để ánh xạ job_id đến tên công việc
          const jobMap = jobs.reduce((acc, job) => {
              acc[job._id] = job.title;
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

          // Thêm tên công việc và định dạng ngày ứng tuyển vào danh sách các công việc ứng tuyển
          const GetAplyJobsWithNames = GetAplyJobs.map(apply => ({
              ...apply,
              jobTitle: jobMap[apply.job_id] || 'Tên công việc không xác định',
              applied_at_formatted: formatDate(apply.applied_at) // Thêm ngày ứng tuyển đã định dạng
          }));

          // Render trang chi tiết công việc với thông tin người lao động và danh sách công việc ứng tuyển
          res.render("../views/Worker/Detail.ejs", { 
              worker: Worker,
              lstAplyJobs: GetAplyJobsWithNames,
              currentPage: page,
              totalPages: totalPages,
              limit: limit,
              search: search
          });
      } else {
          // Nếu không tìm thấy người lao động, trả về lỗi hoặc trang không tìm thấy
          res.status(404).send('Không tìm thấy người lao động.');
      }
  } catch (error) {
      console.log(error);
      res.status(500).send('Đã xảy ra lỗi server.');
  }
};
exports.LockCompanies = async (req, res) => {
  console.log("LockCompanies")
  const Companies = await CompaniesMD.companyModel.findById(
    req.params.company_id
  );

  if (Companies) {
    Companies.status = StatusUser.StatusUser.LOCK;
    await Companies.save();
console.log(Companies);
    res.redirect("/Companies/index");
  }

};
exports.OpenCompanies = async (req, res) => {
 
  const Companies = await CompaniesMD.companyModel.findById(
    req.params.company_id
  );

  if (Companies) {
    Companies.status = StatusUser.StatusUser.ACTIVE;
    await Companies.save();
console.log(Companies);
    res.redirect("/Companies/index");
  }

};

exports.acitve = async (req, res, next) => {
  const companyId = req.params.company_id;

  try {
    // Tìm và update trạng thái của công ty
    const company = await CompaniesMD.companyModel.findByIdAndUpdate(
      companyId,
      { status: StatusUser.StatusUser.ACTIVE }

    );

    if (!company) {
      msg = "Lỗi server";
    }

    // Gửi phản hồi về cho client
  } catch (error) {
    console.error(error);
    msg = "Lỗi server";
  }
  res.redirect("/Companies/index");
};
