const moment = require('moment-timezone');
var db = require("../config/db");
const userSchema= new db.mongoose.Schema(
    {
        email:{type:String, require:true},

        hash_pass:{type:String, require:true},
        phone:{type:String, require:true},
        accout_name: {type:String, require:true},
        gender: {type:String, require:true},
        fcmtoken: {type:String, require:true},
        full_name:{type:String,require:true},
        avata:{type:String,required:false},
        active:{type:String,require: true},
        verify: { type: Boolean, default: false},
        create_at :{type: Date, 
            require: true,
            get: function(date) {
              if (date) {
                return moment(date).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
              }
              return date;
            },
            set: function(date) {
              return moment.tz(date, 'Asia/Ho_Chi_Minh').toDate();
            }, default: Date.now },


        

    },
    {
        collection:'Users'
    }

);

let userModel= db.mongoose.model('userModel', userSchema);

module.exports={userModel};