var CompaniesMD = require('../model/Companies')
const msg = " ";

exports.index = async (req,res,next) => {
    let lstCompanies = await CompaniesMD.companyModel.find();
    console.log(lstCompanies);
    res.render('../views/Companies/index.ejs',{list: lstCompanies})


}

exports.acitve = async (req,res,next) => {
    const companyId = req.params.company_id;

    try {
        // Tìm và update trạng thái của công ty
        const company = await CompaniesMD.companyModel.findByIdAndUpdate(companyId, { active: true });

        if (!company) {
            msg ='Lỗi server'; 
        }

        // Gửi phản hồi về cho client
        
        
    } catch (error) {
        console.error(error);
        msg ='Lỗi server'; 
    }
   res.redirect('/Companies/index');
}