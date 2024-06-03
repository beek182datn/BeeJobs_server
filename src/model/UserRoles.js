const { default: mongoose } = require("mongoose");
var db = require("../config/db");
const UserRoleSchema= new db.mongoose.Schema(
    {
        IdUser:{type:String, require:true},
        IdRole:{type:String, require:true},
       


        

    },
    {
        collection:'UserRoles'
    }

);

let UserRoleModel= db.mongoose.model('UserRoleModel', UserRoleSchema);

module.exports={UserRoleModel};