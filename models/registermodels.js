const mongoose = require('mongoose');
const  findOrCreate = require('mongoose-findorcreate')
const registerSchema = new mongoose.Schema({
    id:Number,
    email:{ type:String, unique:true },
    password:String,
    username:String,    
    token:String,
    image:String,
    role_id:{type: mongoose.Schema.Types.ObjectId, ref:'role'},
    created_on:{ type: Date, default: Date.now },
    updated_on:{ type: Date, default: Date.now },
    googleId: String
    
});

registerSchema.plugin(findOrCreate)
const registerModel = new mongoose.model('registerdata',registerSchema);

module.exports = registerModel