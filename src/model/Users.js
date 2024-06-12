
var db = require("../config/db");
const userSchema= new db.mongoose.Schema(
    {
        email:{type:String, require:true},

        hash_pass:{type:String, require:true},
        phone:{type:String, require:true},
        accout_name: {type:String, require:true},
        gender: {type:String, require:true},
      
        full_name:{type:String,require:true},
        avata:{type:String,required:false},
        active:{type:String,require: true},
        verify: { type: Boolean, default: false},
        create_at :{ type: Date, default: Date.now },


        

    },
    {
        collection:'Users'
    }

);

let userModel= db.mongoose.model('userModel', userSchema);

module.exports={userModel};