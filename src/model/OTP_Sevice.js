const { default: mongoose } = require("mongoose");
var db = require("../config/db");
const moment = require('moment-timezone');
const OtpServiceSchema= new db.mongoose.Schema(
    {
        email: { type: String, required: true },
        otp: { type: String, required: true },
        type: { type: String, required: true },

        created_at: { type: Date, 
            require: true,
            get: function(date) {
              if (date) {
                return moment(date).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
              }
              return date;
            },
            set: function(date) {
              return moment.tz(date, 'Asia/Ho_Chi_Minh').toDate();
            }, default: Date.now, expires: 300 }
       


        

    },
    {
        collection:'OtpServices'
    }

);

let OtpServiceModel= db.mongoose.model('OtpServiceModel', OtpServiceSchema);

module.exports={OtpServiceModel};