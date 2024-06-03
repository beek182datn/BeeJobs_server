const { default: mongoose } = require("mongoose");
var db = require("../config/db");
const UserRoleSchema= new db.mongoose.Schema(
    {
        id_User:{type:String, require:true},
        id_Role:{type:String, require:true},
       


        

    },
    {
        collection:'UserRoles'
    }

);

let UserRoleModel= db.mongoose.model('UserRoleModel', UserRoleSchema);

module.exports={UserRoleModel};