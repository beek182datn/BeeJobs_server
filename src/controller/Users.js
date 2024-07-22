var UsersMD  = require("../model/Users");


exports.index = async (req,res,next) => {
    let lstUsers = await UsersMD.userModel.find();
    console.log(lstUsers);
    res.render('../views/Users/index.ejs',{list: lstUsers})


}