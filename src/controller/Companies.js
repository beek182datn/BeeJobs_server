var CompaniesMD = require("../model/Companies");
const msg = " ";
var StatusUser = require("../../src/config/Constans");
var {historyTransModel} = require("../model/History_Trans");
exports.index = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const skip = (page - 1) * limit;

    const query = search
      ? { company_name: { $regex: search, $options: 'i' } }
      : {};

    const totalCompanies = await CompaniesMD.companyModel.countDocuments(query);
    const totalPages = Math.ceil(totalCompanies / limit);

    const lstCompanies = await CompaniesMD.companyModel
      .find(query)
      .skip(skip)
      .sort({ _id: -1 })
      .limit(limit)
      .lean();

    res.render("../views/Companies/index.ejs", {
      list: lstCompanies,
      currentPage: page,
      totalPages: totalPages,
      limit: limit,
      search: search
    });
  } catch (error) {
    next(error);
  }
};

exports.GetInfoCompany = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;


    const Companies = await CompaniesMD.companyModel.findById(
      req.params.Idcompany
    );
    if (Companies) {
      const query = { company_id: Companies._id };
      
      const totalCompanies = await historyTransModel.countDocuments(query);
      const totalPages = Math.ceil(totalCompanies / limit);
     
      const GetHistoryTrans =  await historyTransModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ _id: -1 })
      .lean();
      res.render("../views/Companies/Detail.ejs", { companies: Companies,lstHostoryTrans: GetHistoryTrans, currentPage: page,
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
