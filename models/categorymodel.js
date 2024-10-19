const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
    id:Number,
    categoryname:String,

});


const categoryModel = new mongoose.model('categorydata',categorySchema);
module.exports = categoryModel;
