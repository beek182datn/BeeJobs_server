var CompaniesMD = require("../model/Companies");
const msg = " ";

exports.index = async (req, res, next) => {
  let lstCompanies = await CompaniesMD.companyModel.find();
  console.log(lstCompanies);
  res.render("../views/Companies/index.ejs", { list: lstCompanies });
};

exports.GetInfoCompany = async (req, res, next) => {
  try {
    const Companies = await CompaniesMD.companyModel.findById(
      req.params.Idcompany
    );
    if (Companies) {
      res.render("../views/Companies/Detail.ejs", { companies: Companies });
    }
  } catch (error) {
    console.log(error);
  }
};
exports.LockCompanies = async (req, res) => {
  const Companies = await CompaniesMD.companyModel.findById(
    req.params.company_id
  );

  if (Companies) {
    Companies.status = StatusUser.LOCK;
    await Companies.save();

    res.redirect("/Companies/index");
  }
};

exports.acitve = async (req, res, next) => {
  const companyId = req.params.company_id;

  try {
    // Tìm và update trạng thái của công ty
    const company = await CompaniesMD.companyModel.findByIdAndUpdate(
      companyId,
      { status: StatusUser.Acivate }
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
