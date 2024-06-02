
var db = require("./db");
const userSchema= new db.mongoose.Schema(
    {
        email:{type:String, require:true},

        hash_pass:{type:String, require:true},
        phone:{type:String, require:true},
        accout_name: {type:String, require:true},
        gender: {type:String, require:true},
        Hashpassword:{type:String, require:true},
        Name:{type:String,require:true},
        Avata:{type:String,required:false},
        active:{type:String,require: true},


        

    },
    {
        collection:'user'
    }

);

let userModel= db.mongoose.model('userModel', userSchema);

module.exports={userModel};