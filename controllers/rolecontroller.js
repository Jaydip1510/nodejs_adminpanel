const roleModel = require('../models/rolemodel')
const express = require('express');
const app = express();
var LocalStorage = require('node-localstorage').LocalStorage,
    localStorage = new LocalStorage('./scratch');


// get role form
const getdata = async (req, res) => {
    let role = JSON.parse(localStorage.getItem('userRole'));
    res.render('role', {
        username: req.cookies.UserName,
        userimage: req.cookies.image,
        message: '',
        selected: '',
        AllRoleData: '',
        role: role
    })
}


// role data insert in role database & table

const getroledata = async (req, res) => {
    const rolename = req.body.rolename;
    const checkrole = await roleModel.findOne({ rolename: rolename });
    if (checkrole) {
        req.flash('msg_category', 'Role already exists');
        req.flash('msg_class', 'alert-success');
        res.redirect("/allroledata");
    } else {

        const role = {
            rolename: rolename
        }
        const savedata = new roleModel(role);
        await savedata.save();
        req.flash('msg_category', 'Role inserted successfully');
        req.flash('msg_class', 'alert-success');
        res.redirect("/allroledata");
    }
}


//display role data in role table

const allroledata = async (req, res) => {
    let role = JSON.parse(localStorage.getItem('userRole'));
    if (role === "admin") {


        const role_data = await roleModel.find();
        res.render('role', {
            username: req.cookies.UserName,
            AllRoleData: role_data,
            userimage: req.cookies.image,
            selected: 'subcat',
            role_edit: '',
            message: req.flash('msg_category'),
            message_class: req.flash('msg_class'),
            role: role
        })
    }
}

// delete role data in database & table

const roledatadelete = async (req, res) => {
    const id = req.params.id;
    const data = await roleModel.findByIdAndRemove({ _id: id });
    req.flash('msg_category', 'Role deleted successfully');
    req.flash('msg_class', 'alert-success');
    res.redirect("/allroledata");
}

//role edit in table and display value textbox

const roledataedit = async (req, res) => {
    let role = JSON.parse(localStorage.getItem('userRole'));
    const id = req.params.id;
    let roledata = await roleModel.find()
    result = await roleModel.findOne({ _id: id });
    res.render('role', {
        username: req.cookies.UserName,
        AllRoleData: roledata,
        userimage: req.cookies.image,
        selected: '',
        role_edit: result,
        message: '',
        role: role
    });
}


// role update in table & database
const roleupdate = async (req, res) => {
    const rolename = req.body.rolename;
    const id = req.params.id
    const result = await roleModel.findByIdAndUpdate({ _id: id }, {
        $set: {
            rolename: rolename,
        }
    })
    req.flash('msg_category', 'Role updated successfully');
    req.flash('msg_class', 'alert-success');
    res.redirect("/allroledata");
}

module.exports = {
    getroledata,
    getdata,
    allroledata,
    roledatadelete,
    roledataedit,
    roleupdate

};