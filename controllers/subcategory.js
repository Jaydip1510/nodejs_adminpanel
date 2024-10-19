const express = require('express');
const subcatModel = require('../models/subcategorymodel');
const categoryModel = require('../models/categorymodel');
const app = express();
app.use(express.json());
var LocalStorage = require('node-localstorage').LocalStorage,
localStorage = new LocalStorage('./scratch');



// data insert subcategory in subcategory table

const subcategorydata = async (req, res) => {
    const name = req.body.name;
    const id = req.body.cat_id;
    const checkName = await subcatModel.findOne({ name: name });
    if(checkName) {
        req.flash('msg_category', 'Subcategory already exists');
        req.flash('msg_class', 'alert-success');
        res.redirect("/subcategory/alldata");
    }else{
    const result = {
        cat_id: id,
        name: name
    }
    const savedata = new subcatModel(result);
    await savedata.save();

    allsubcat = await subcatModel.find();
    req.flash('msg_category', 'Subcategory inserted successfully');
    req.flash('msg_class', 'alert-success');
    res.redirect("/subcategory/alldata");
  }
}


// update subcategory 

const updatesubcat = async (req, res) => {
    let getAllCat = await subcatModel.find();
    console.log(getAllCat);
    const name = req.body.name;
    const id = req.body.cat_id;
    const subid = req.params.id;
    const result = await subcatModel.findByIdAndUpdate({ _id: subid }, {
        $set: {
            name: name,
            cat_id: id
        }
    })
    req.flash('msg_category', 'SubCategory updated successfully');
    req.flash('msg_class', 'alert-success');
    res.redirect("/subcategory/alldata");
}

// data display in subcategory table

const SubCatData = async (req, res) => {
    let catData = await categoryModel.find();
    let role = JSON.parse(localStorage.getItem('userRole'));
    // console.log(catData);
    const joindata = await subcatModel.find().populate("cat_id");
    res.render('subcat', {
        username: req.cookies.UserName,
        AllSubCat: joindata,
        catData: catData,
        userimage: req.cookies.image,
        selected: 'subcat',
        subcatedit: '',
        message: req.flash('msg_category'),
        message_class: req.flash('msg_class'),
        role:role
    });

}

// filtering category data

const getCatdata = async (req, res) => {
    let cat_id = req.query.selectedValue;
    let catdata;
    if (cat_id != '') {

        catdata = await subcatModel.find({ cat_id: cat_id }).populate("cat_id");
    } else {
        catdata = await subcatModel.find().populate("cat_id");
    }
    res.json(catdata);
}

//searching category in data table

const getsearching = async (req,res) => {
  let searchdata = req.query.selectedValue;
  const categorys = await categoryModel.find({
    categoryname:{$regex: new RegExp(searchdata,"i")}
  });

  let subcategory = await subcatModel.find({
    cat_id:{ $in: categorys.map(category => category._id) }
  }).populate("cat_id");

  if(subcategory ==''){
    subcategory = await subcatModel.find({name:{$regex: new RegExp(searchdata,"i")}}).populate("cat_id");
  }
  res.json(subcategory);
}

// data delete in subcategory table

const subcatdelete = async (req, res) => {
    const id = req.params.id;
    const data = await subcatModel.findByIdAndRemove({ _id: id });
    req.flash('msg_category', 'Subcategory deleted successfully');
    req.flash('msg_class', 'alert-success');
    res.redirect("/subcategory/alldata");
}

const subcatedit = async (req, res) => {
    let id = req.params.id;
    let catData = await categoryModel.find();
    let subdata = await subcatModel.find().populate('cat_id');
    result = await subcatModel.findOne({ _id: id });
    res.render('subcat', {
        username: req.cookies.UserName,
        AllSubCat: subdata,
        catData: catData,
        userimage: req.cookies.image,
        selected: 'subcat',
        subcatedit: result,
        message: '',
        role:''
    });
}


// Api subcategory insert data

const api_subcategory = async (req,res) =>{
    const name = req.body.name;
    const cat_id = req.body.cat_id;
    const checkName = await subcatModel.findOne({ name: name });
    if(checkName){
       console.log('subcategory already exists');
    }else{
        const subresult = {
            name: name,
            cat_id: cat_id,
        }
        const savedata = new subcatModel(subresult);
        let subcategorydata =  await savedata.save();
        console.log("data inserted successfully");
        res.json(subcategorydata); 
    }
    
     
}

// subcategory display for API

const api_subcategorydisplay = async(req,res) =>{
  const subcatdata = await subcatModel.find({});
  res.json(subcatdata);
}

// subcategory delete for API

const api_subcategorydelete = async(req,res) =>{
   const id = req.params.id;
   const subdata = await subcatModel.deleteOne({_id:id});
   console.log("data deleted for subcategory");
   res.json(subdata);
}

// subcategory edit for API

const api_subcategoryedit = async(req,res) =>{
    const id = req.params.id;
    let  subcatedit = await subcatModel.findOne({_id: id});
    res.json(subcatedit);
}

// subcategory update for API

const api_subcategoryupdate = async(req,res) =>{
    const id = req.params.id;
    const name = req.body.name;
    const cat_id = req.body.cat_id;

    const subcatresult = await subcatModel.updateOne({_id:id},{
        $set:{
            name:name,
            cat_id:cat_id
        }
    });
    res.json(subcatresult);
}

module.exports = {
    subcategorydata,
    SubCatData,
    subcatdelete,
    subcatedit,
    updatesubcat,
    getCatdata,
    getsearching,
    api_subcategory,
    api_subcategorydisplay,
    api_subcategorydelete,
    api_subcategoryedit,
    api_subcategoryupdate
}