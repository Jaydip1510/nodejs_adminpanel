const mongoose = require('mongoose');
const profileSchema = new mongoose.Schema({
    firstname:String,
    lastname:String,
    gender:String,
    mobile:Number,
    email:String,
    location:String,
    image:String,

});


const profileModel = new mongoose.model('profiledata',profileSchema);
module.exports = profileModel;