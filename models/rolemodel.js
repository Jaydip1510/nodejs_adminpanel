const mongoose = require('mongoose');
const roleSchema = new mongoose.Schema({

    rolename:String,
    isActive:Boolean,
});


const roleModel = new mongoose.model('role',roleSchema);
module.exports = roleModel;
