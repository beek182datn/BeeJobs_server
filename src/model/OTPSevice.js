const { default: mongoose } = require("mongoose");
var db = require("../config/db");
const OtpServiceSchema= new db.mongoose.Schema(
    {
        email: { type: String, required: true },
        otp: { type: String, required: true },
        type: { type: String, required: true },

        created_at: { type: Date, default: Date.now, expires: 300 }
       


        

    },
    {
        collection:'OtpServices'
    }

);

let OtpServiceModel= db.mongoose.model('OtpServiceModel', OtpServiceSchema);

module.exports={OtpServiceModel};