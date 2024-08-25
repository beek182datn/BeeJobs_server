var {historyTransModel} = require('../model/History_Trans');
var {companyModel}= require('../model/Companies');
exports.index = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
  
      const skip = (page - 1) * limit;
  
      // Tìm các công ty phù hợp với tìm kiếm
      const companies = await companyModel.find({
        company_name: { $regex: search, $options: 'i' }
      }).lean();
  
      // Tạo một map từ company_id đến company_name
      const companyMap = companies.reduce((acc, company) => {
        acc[company._id.toString()] = company.company_name;
        return acc;
      }, {});
  
      // Sử dụng $in để tìm tất cả các bản ghi lịch sử giao dịch có company_id trong danh sách công ty tìm được
      const query = search
        ? { company_id: { $in: companies.map(c => c._id) } }
        : {};
  
      const totalHostoryTrans = await historyTransModel.countDocuments(query);
      const totalPages = Math.ceil(totalHostoryTrans / limit);
  
      const lstHistoryTrans = await historyTransModel
        .find(query)
        .skip(skip)
        .sort({ _id: -1 })
        .limit(limit)
        .lean();
  
      // Thêm company_name vào mỗi bản ghi trong lstHistoryTrans
      const lstHistoryTransWithCompanyName = lstHistoryTrans.map(trans => ({
        ...trans,
        company_name: companyMap[trans.company_id.toString()] || 'Unknown'
      }));
  
      res.render("../views/historytrans/index.ejs", {
        list: lstHistoryTransWithCompanyName,
        currentPage: page,
        totalPages: totalPages,
        limit: limit,
        search: search
      });
    } catch (error) {
      next(error);
    }
  };