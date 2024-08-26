var CompaniesMD = require("../model/Companies");
const msg = " ";
var StatusUser = require("../../src/config/Constans");
var {historyTransModel} = require("../model/History_Trans");
var {applyJobModel} = require("../model/ApplyJobs");
var WorkerMD = require("../model/Workers");


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

exports.GetInfoWoker = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;


    const Worker = await WorkerMD.findById(
      req.params.IdWoker
    );
    if (Worker) {
      const query = { worker_id: Worker.user_id};
      
      const totalAplyJobs = await applyJobModel.countDocuments(query);
      const totalPages = Math.ceil(totalAplyJobs / limit);
     
      const GetAplyJobs =  await applyJobModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ _id: -1 })
      .lean();
      res.render("../views/Worker/Detail.ejs", { woker: Worker,lstAplyJobs: GetAplyJobs, currentPage: page,
        totalPages: totalPages,
        limit: limit,
        search: search});
    }
  } catch (error) {
    console.log(error);
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
