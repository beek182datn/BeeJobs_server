const { default: mongoose } = require("mongoose");
var db = require("./db");
const UserRoleSchema= new db.mongoose.Schema(
    {
        IdUser:{type:String, require:true},
        IdRole:{type:String, require:true},
       


        

    },
    {
        collection:'UserRole'
    }

);

let UserRoleModel= db.mongoose.model('UserRoleModel', UserRoleSchema);

module.exports={UserRoleModel};