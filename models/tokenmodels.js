const mongoose = require('mongoose');
/** OTP TokenSchema */
const tokenSchema = new mongoose.Schema({
    email:{ type:String, required:true, unique:true },
    otp:Number,
    createdAt: {type: Date,default: Date.now},
    validTill: {type: Date,default: Date.now},
});
const tokenModel = new mongoose.model('tokendata',tokenSchema);
module.exports = tokenModel