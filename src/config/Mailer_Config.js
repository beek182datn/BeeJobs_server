require('dotenv').config();


module.exports = {
    MAILER: {
        MAIL_MAILER: process.env.MAIL_MAILER,
        MAIL_HOST: process.env.MAIL_HOST,
        MAIL_PORR: process.env.MAIL_PORR,
        MAIL_USERNAME: process.env.MAIL_USERNAME,
        MAIL_PASSSWORD: process.env.MAIL_PASSSWORD,
        MAIL_ENCRYPTION: process.env.MAIL_ENCRYPTION,
        MAIL_FORM_ADDRESS: process.env.MAIL_FORM_ADDRESS,
        MAIL_FROM_NAME: process.env.MAIL_FROM_NAME,
    }, MAIL_TYPE: {
        OTP_SignUp: "signUp",
        OTP_FogotPassword: "FogotPassword"
    }

}