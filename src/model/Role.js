const { default: mongoose } = require("mongoose");
var db = require("./db");
const RoleSchema= new db.mongoose.Schema(
    {
        Name:{type:String, require:true},
        Code:{type:String, require:true},
       


        

    },
    {
        collection:'Role'
    }

);

let RoleModel= db.mongoose.model('RoleModel', RoleSchema);

module.exports={RoleModel};