const mongoose = require('mongoose');

 const subCategorySchema = new mongoose.Schema({
         name: String,
         cat_id:{type: mongoose.Schema.Types.ObjectId, ref:'categorydata'}
   });

 const subcatModel = new mongoose.model('subcategory',subCategorySchema);
 module.exports = subcatModel