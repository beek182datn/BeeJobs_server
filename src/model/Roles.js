const { default: mongoose } = require("mongoose");
var db = require("../config/db");
const RoleSchema= new db.mongoose.Schema(
    {
        Name:{type:String, require:true},
        Code:{type:String, require:true},
       


        

    },
    {
        collection:'Roles'
    }

);

let RoleModel= db.mongoose.model('RoleModel', RoleSchema);

module.exports={RoleModel};