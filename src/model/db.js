require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URL_CONNECTION,{
    useNewUrlParser: true, useUnifiedTopology: true 
}).then(()=>{
    console.log("Connet SuccessFully");
})
.catch((err)=>{
    console.log('Loi ket noi CSDL');
    console.log(err);
})

module.exports = {mongoose};