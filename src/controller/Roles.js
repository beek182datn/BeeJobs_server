var RoleMD = require("../model/Roles");


exports.CreateRole = async (req,res) => {
    console.log("Đay");
    console.log(req.body);
    let msg = "";
    if (req.method == "POST") {
        const {Name, Code} = req.body;
        
        try {
            let objRole = await RoleMD.RoleModel.findOne({Code: Code});
            if (objRole) {

                msg = "Quyền đã tồn tại";
            
               
            }else {
                let myMD = new RoleMD.RoleModel({Name: Name, Code: Code});
                await myMD.save();
                
            }

           

        } catch (error) {
            console.log("Error"+ error.message);
        }
    }

res.render("../views/Role/index.ejs",{msg:msg})
};