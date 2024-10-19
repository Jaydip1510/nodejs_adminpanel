let categoryModel = require('../models/categorymodel');
const subcatModel = require('../models/subcategorymodel')
const express = require('express');
const app = express();
var LocalStorage = require('node-localstorage').LocalStorage,
localStorage = new LocalStorage('./scratch');

// insert category
const getcategorydata = async (req, res) => {
    const id = req.params.unique_id;
    const catname = req.body.categoryname;
    if (id === undefined) {
        const checkName = await categoryModel.findOne({ categoryname: new RegExp(catname, 'i') })
        if (checkName) {
            req.flash('msg_category', 'category already exists');
            req.flash('msg_class', 'alert-danger');
            res.redirect('/category');
        } else {
            var totdata = await categoryModel.countDocuments();
            const result = new categoryModel({
                id: (totdata + 1),
                categoryname: req.body.categoryname,
            });
            const res1 = await result.save()
            console.log("data saved" + res1);
            req.flash('msg_category', 'data inserted successfully');
            req.flash('msg_class', 'alert-success');
            res.redirect('/category');
        }
    }
    else {
        //Edit Data
        let is_save = true;
        let chk_data = await categoryModel.findOne({ _id: id });
        if (chk_data) {
            var tmp_catname = chk_data.categoryname;
             if (tmp_catname.toUpperCase() != catname.toUpperCase()) {
                const checkName = await categoryModel.findOne({ categoryname: new RegExp(catname, 'i') });
                if (checkName) {
                    req.flash('msg_category', 'category already exists.');
                    req.flash('msg_class', 'alert-danger');
                    is_save = false;
                }
            }
            if (is_save) {
                req.flash('msg_category', 'category updated successfully');
                req.flash('msg_class', 'alert-success');
                let final = await categoryModel.updateOne({ _id: id },
                    { $set: { categoryname: req.body.categoryname } });
                console.log(final);
            }
        }
        res.redirect('/category');
    }
}

// display category 
const categorydisplay = async (req, res) => {
    const categoryData = await categoryModel.find({})
    let role = JSON.parse(localStorage.getItem('userRole'));
    if (!categoryData) {
        console.log(err);
    } else {
        res.render("category", {
            username: req.cookies.UserName,
            details: categoryData,
            selected: 'category',
            message: req.flash('msg_category'),
            message_class: req.flash('msg_class'),
            userimage:req.cookies.image,
            data: '',
            role:role
        });
    }
}

// delete category

const categorydelete = async (req, res) => {
    let id = req.params.uniqe_id;
    const subcat = await subcatModel.find({cat_id:id});
    if (subcat) {
        req.flash('msg_category', 'category has subcategory so first delete it');
        req.flash('msg_class', 'alert-success');
        res.redirect('/category');
    }else{
        await categoryModel.deleteOne({ _id: id });
        req.flash('msg_category', 'data deleted successfully');
        req.flash('msg_class', 'alert-success');
        res.redirect('/category');

    }
    
}

// update category

const categoryedit = async (req, res) => {
    let id = req.query.id;
    let data = await categoryModel.findOne({ _id: id });
    const categoryData = await categoryModel.find({})
    res.render('category', {
        data: data,
        username: req.cookies.UserName,
        details: categoryData,
        selected: 'category',
        userimage:req.cookies.image,
        message: '',
        role:''
    });
};

// insert category from API

const api_category = async(req,res) =>{
    const categoryname = req.body.categoryname;
    const checkName = await categoryModel.findOne({ categoryname: categoryname });
    if(checkName){
        console.log('category already exists')
    }else{
        const result = {
    
            categoryname: categoryname
        }
        const savedata = new categoryModel(result);
        let categorydata =  await savedata.save();
        res.json(categorydata);  
    }
   
}

//display category data from API

const api_categorydisplay = async(req,res) =>{
    const apicategorydata = await categoryModel.find({});
     res.json(apicategorydata);
}

// delete category data from API

const api_categorydelete = async(req,res) =>{
    const id = req.params.id;
    const data = await categoryModel.deleteOne({ _id: id });
    res.json(data);
}

// update categor from API

const api_categoryedit = async (req,res) =>{
    const id = req.params.id;
    let  catedit = await categoryModel.findOne({_id: id});
    res.json(catedit);
}

const api_categoryupdate = async (req,res) =>{
    const id = req.params.id;
    const categoryname = req.body.categoryname;
    const result = await categoryModel.updateOne({_id:id},{
        $set :{
            categoryname: categoryname
        }
    });
    res.json(result);
}

module.exports = {
    getcategorydata,
    categorydisplay,
    categorydelete,
    categoryedit,
    api_category,
    api_categorydisplay,
    api_categorydelete,
    api_categoryedit,
    api_categoryupdate


} 