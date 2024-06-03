const { default: mongoose } = require("mongoose");
var db = require("../config/db");
const OtpServiceSchema= new db.mongoose.Schema(
    {
        email: { type: String, required: true },
        otp: { type: String, required: true },
        createdAt: { type: Date, default: Date.now, expires: 300 }
       


        

    },
    {
        collection:'OtpService'
    }

);

let OtpServiceModel= db.mongoose.model('OtpServiceModel', OtpServiceSchema);

module.exports={OtpServiceModel};