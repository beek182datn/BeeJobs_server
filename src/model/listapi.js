const { default: mongoose } = require("mongoose");
var db = require("./db");
const ApiListSchema= new db.mongoose.Schema(
    {
        Name:{type:String, require:true},
        Code:{type:String, require:true},
       


        

    },
    {
        collection:'Role'
    }

);

let ApiListModel= db.mongoose.model('ApiListModel', ApiListSchema);

module.exports={ApiListModel};