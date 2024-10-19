let registerModel = require('../models/registermodels');
let profileModel = require('../models/profile');
let tokenModel = require('../models/tokenmodels');
let roleModel = require('../models/rolemodel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const saltRounds = 10;

var GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const secret_key = "secret1234";
var LocalStorage = require('node-localstorage').LocalStorage,
    localStorage = new LocalStorage('./scratch');
//Encrypting text
const encrypt_text = async (plainText, password) => {
    try {
        const iv = crypto.randomBytes(16);
        const key = crypto.createHash('sha256').update(password).digest('base64').substr(0, 32);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

        let encrypted = cipher.update(plainText);
        encrypted = Buffer.concat([encrypted, cipher.final()])
        return iv.toString('hex') + ':' + encrypted.toString('hex');

    } catch (error) {
        console.log(error);
    }
}
// Decrypting text
const decrypt_text = async (encryptedText, password) => {
    try {
        const textParts = encryptedText.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');

        const encryptedData = Buffer.from(textParts.join(':'), 'hex');
        const key = crypto.createHash('sha256').update(password).digest('base64').substr(0, 32);
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

        const decrypted = decipher.update(encryptedData);
        const decryptedText = Buffer.concat([decrypted, decipher.final()]);
        return decryptedText.toString();
    } catch (error) {
        console.log(error)
    }
}

const checkUser = async (req, res) => {
    if (req.cookies) {
        if (req.cookies.UserName === undefined || req.cookies.UserName === 'undefined') {
            res.clearCookie('UserName');
            res.redirect('/');
            return false;
        }
        return true;
    }
}

const dataUser = async (req, res) => {
    if (req.cookies && req.cookies.UserName != 'admin') {
        return res.redirect('/');
    }
};

const getDashboard = async (req, res) => {
    var a = await checkUser(req, res);
    let role = JSON.parse(localStorage.getItem('userRole'));
    let cookie_username = req.cookies.UserName !== undefined && req.cookies.UserName !== '' ? req.cookies.UserName : "",
        cookie_image =  req.cookies.image !== undefined && req.cookies.image !== '' ? req.cookies.image : "";
        console.log('cookie_username => '+cookie_username);
        console.log('cookie_image => '+cookie_image);
    res.render('index', 
        { username: cookie_username, 
          userimage: cookie_image,
          selected: 'admin', 
          roledata: '', 
          role: role 
        })
    /*if (a === true) {
        res.render('index', { username: req.cookies.UserName, userimage: req.cookies.image, selected: 'admin', roledata: '', role: role });
    } else {
        res.render('index', { username: req.cookies.UserName, userimage: req.cookies.image, selected: 'admin', roledata: '', role: role })
    }*/
};



const gettable = async (req, res) => {
    let role = JSON.parse(localStorage.getItem('userRole'));
    await checkUser(req, res)
    res.render('producttable', { username: req.cookies.UserName, role: role, userimage: req.cookies.image, roledata: '', selected: 'producttable' });
}

const getchart = async (req, res) => {
    let role = JSON.parse(localStorage.getItem('userRole'));
    await checkUser(req, res)
    res.render('chart', { username: req.cookies.UserName, userimage: req.cookies.image, roledata: '', selected: 'chart', role: role });
}


const getwidgets = async (req, res) => {
    let role = JSON.parse(localStorage.getItem('userRole'));
    await checkUser(req, res)
    res.render('widget', { username: req.cookies.UserName, role: role, userimage: req.cookies.image, roledata: '', selected: 'widget' });
}

const getbutton = async (req, res) => {
    let role = JSON.parse(localStorage.getItem('userRole'));
    await checkUser(req, res)
    res.render('button', { username: req.cookies.UserName, role: role, userimage: req.cookies.image, roledata: '', selected: 'button' });
}

const gettypography = async (req, res) => {
    let role = JSON.parse(localStorage.getItem('userRole'));
    await checkUser(req, res)
    res.render('typography', { username: req.cookies.UserName, role: role, userimage: req.cookies.image, roledata: '', selected: 'typography' });
}


const getotherElement = async (req, res) => {
    let role = JSON.parse(localStorage.getItem('userRole'));
    await checkUser(req, res)
    res.render('element', { username: req.cookies.UserName, role: role, userimage: req.cookies.image, roledata: '', selected: 'element' });
}

const getprofile = async (req, res) => {
    let role = JSON.parse(localStorage.getItem('userRole'));
    await checkUser(req, res)
    let profile_data = await profileModel.findOne({ email: req.cookies.Useremail });
    res.render('profile', { profile_data: profile_data, role: role, username: req.cookies.UserName, useremail: req.cookies.Useremail, userimage: req.cookies.image, roledata: '', selected: 'profile', is_edit: false });
}

const transpoter = nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    auth: {
        user: "makwanajaydip1510@gmail.com",
        pass: 'bmtj bjli qtso lalj',
    },
    secure: true,
});

const getregister = async (req, res) => {
    const roledata = await roleModel.find({});
    let role = JSON.parse(localStorage.getItem('userRole'));
    res.render('register', {
        roledata: roledata,
        checkuser: '',
        message: req.flash('msg_category'),
        message_class: req.flash('msg_class'),
        role: role,
        asset_path: '../'
    })
}

const registerdata = async (req, res) => {
    let mode = req.params.id !== undefined || req.params.id != '' ? 'GoogleReg' : '';
    let reg_id = req.params.id !== undefined || req.params.id != '' ? req.params.id : '';
    let isAllowToCreate = true;
    const { username, password, email, role_id } = req.body
    //STEP - 1 : Find the role with "ADMIN" role
    const adminRoleId = await roleModel.findOne({ rolename: 'admin' });
    //STEP- 1.1 : Find the role with "MANAGER" role
    const managerRoleId = await roleModel.findOne({ rolename: 'manager' });
    if (role_id == adminRoleId._id) {
        //STEP- 2 : Check if any user exists with "ADMIN" role
        const checkAdminRoleUser = await registerModel.findOne({ role_id: adminRoleId._id });
        if (checkAdminRoleUser) {
            isAllowToCreate = false;
            req.flash('msg_category', 'Admin already exists');
            req.flash('msg_class', 'alert-success');
            res.redirect("/getregister");

        }
    } else if (role_id == managerRoleId._id) {
        //STEP- 2 : Check if any user exists with "ADMIN" role
        const checkManagerRoleUser = await registerModel.find({ role_id: managerRoleId._id });
        if (checkManagerRoleUser.length >= 2) {
            isAllowToCreate = false;
            req.flash('msg_category', 'Two Managers already exists');
            req.flash('msg_class', 'alert-danger');
            res.redirect("/getregister");
        }
    }
    if (isAllowToCreate) {
        if (mode == '') {
            const chackdata = await registerModel.findOne({ email: email });
            if (chackdata) {
                return res.send("Email already registered");
            } else {
                const crypted = await bcrypt.hash(password, saltRounds)


                const res2 = new registerModel({
                    id: 1,
                    email: email,
                    password: crypted,
                    username: username,
                    token: '',
                    role_id: role_id,
                    roledata: '',
                });
                await res2.save();
                var token = jwt.sign({ res2: res2 }, secret_key)
                console.log("generated token");
                console.log(token);
                let _id = res2._id;
                console.log(_id);
                const result = await registerModel.findByIdAndUpdate({ _id }, { $set: { token: token } })
                console.log(result);
                res.redirect('/login');
            }
        } else if (mode == 'GoogleReg') {
            const crypted = await bcrypt.hash(password, saltRounds)
            const updateReqData = await registerModel.updateOne({ _id: reg_id }, {
                $set:
                {
                    email: email,
                    password: crypted,
                    username: username,
                    token: '',
                    role_id: role_id,
                    roledata: ''
                }
            })
            const userRegData = await registerModel.findOne({ _id: reg_id }).populate('role_id');
            var token = jwt.sign({ res2: userRegData }, secret_key);
            const result = await registerModel.updateOne({ _id: reg_id }, { $set: { token: token } })
            console.log(result);
            res.cookie('UserName', userRegData.username !== undefined ? userRegData.username : '');
            res.cookie('Useremail', userRegData.email !== undefined ? userRegData.email : '');

            let rolename = userRegData.role_id.rolename;
            localStorage.setItem('userToken', JSON.stringify(userRegData.token));
            localStorage.setItem('userRole', JSON.stringify(rolename));
            res.cookie('image', userRegData.image);
            res.redirect('/admin');
        }

        const mailInfo = {
            from: "makwanajaydip1510@gmail.com",
            to: email,
            subject: "Admin Panel",
            text: "Regidtration",
            html: "<a>click here registere"
        }
        // await transpoter.sendMail(mailInfo);
    }
}

const checkUserData = async (req, res) => {
    const dataUser = await registerModel.findOne({ email: req.body.email, password: req.body.password });
    let role = JSON.parse(localStorage.getItem('userRole'));
    if (dataUser) {
        res.cookie('UserName', dataUser.username);
        res.redirect('/admin');
    } else {
        req.flash('danger', 'Email or password wrong !!!');
        res.render('login', { message: req.flash('danger'), message_class: 'alert-danger', roledata: '', role: role });
    }
}

const checkLogindata = async (req, res) => {
    let userdata = await registerModel.findOne({ email: req.body.email }).populate('role_id');
    let role = JSON.parse(localStorage.getItem('userRole'));
    if (!userdata) {
        req.flash('emsg_token', 'User not found');
        emsg_token = req.flash('emsg_token');
        res.render("login", { message: emsg_token, message_class: 'alert-danger', roledata: '', role: role });
    } else {

        const isPasswordValid = await bcrypt.compare(req.body.password, userdata.password);

        if (!isPasswordValid) {
            req.flash('emsg_token', 'Invalid password');
            emsg_token = req.flash('emsg_token');
            res.render("login", { message: emsg_token, message_class: 'alert-danger', roledata: '', role: role });
        } else {



            res.cookie('UserName', userdata.username);
            res.cookie('Useremail', userdata.email);

            let rolename = userdata.role_id.rolename;
            localStorage.setItem('userToken', JSON.stringify(userdata.token));
            localStorage.setItem('userRole', JSON.stringify(rolename));

            let read = await profileModel.findOne({ email: userdata.email });
            if (read) {
                res.cookie('image', read.image);
            }


            res.redirect('admin');
        }
    }


}

function createOtp() {
    var min = 100000;
    var max = 999999;
    otp = Math.floor(Math.random() * (max - min)) + min;
    return otp;
}

const sendOtp = async (req, res) => {
    email = req.body.email;
    let getdata = await registerModel.findOne({ email: req.body.email })
    let role = JSON.parse(localStorage.getItem('userRole'));
    if (!getdata) {
        req.flash('emsg_token', 'User not found');
        emsg_token = req.flash('emsg_token');
        res.render("forget", { message: emsg_token, message_class: 'alert-danger', roledata: '', role: role });
    } else {
        otp = createOtp();
        /**
         * Update otp into the database then send email.
         */
        try {
            //const updata = await registerModel.updateOne({ email: email }, { $set: { otp: otp } });
            //console.log(updata);
            let tok_exists = await tokenModel.findOne({ email: email })
            if (tok_exists) {
                let del_tok = await tokenModel.deleteMany({ email: email });
                console.log(del_tok);
            }
            const result = new tokenModel({
                email: email,
                otp: otp
            });
            const res1 = await result.save()
            console.log("data saved" + res1);
        } catch (e) {
            console.log(e);
        }
        const transporter = nodemailer.createTransport({
            port: 465,
            host: "smtp.gmail.com",
            auth: {
                user: "makwanajaydip1510@gmail.com",
                pass: 'bmtj bjli qtso lalj',
            },
            secure: true,
        });
        const crypted = await encrypt_text(email, secret_key);

        var href = `http://localhost:8004/resetcred?token=${crypted}`;
        const mailInfo = {
            from: "kanjariyanilesh@gmail.com",
            to: email,
            subject: `Reset password Admin panel`,
            html: `<p>your OTP is ${otp} <a href="${href}">Reset Password</a></p>`
        }
        await transporter.sendMail(mailInfo)
        req.flash('smsg_forget', 'Password reset link has been shared to your registerd email address, please check your email account.');
        res.render('forget', { message: req.flash('smsg_forget'), message_class: 'alert-success', roledata: '', role: role });
    }

}

const vaildtoken = async (req, res) => {
    var emsg_token = '';
    let role = JSON.parse(localStorage.getItem('userRole'));
    console.log(req.query.token);
    if (req.query.token) {
        var token = req.query.token.toString();
        const dcrypted = await decrypt_text(token, secret_key);
        console.log(dcrypted);
        if (!dcrypted) {
            req.flash('emsg_token', 'Invaild token');
            emsg_token = req.flash('emsg_token');
        }
        res.render('resetpassword', { email: dcrypted, message: emsg_token, roledata: '', role: role });
    } else {
        
        // step 1: check otp in schema: tokendatas
        let tok_exists = await tokenModel.findOne({ email: req.body.email })
        if (tok_exists) {
            console.log(tok_exists);
            if (req.body.otp == tok_exists.otp) {
                let del_tok = await tokenModel.deleteMany({ email: req.body.email });
                console.log(del_tok);
                // step 2 : password update in schema registerdatas
                let getdata = await registerModel.findOne({ email: req.body.email })
                if (!getdata) {
                    req.flash('emsg_token', 'user not found');
                    emsg_token = req.flash('emsg_token');
                    res.render('resetpassword', { message: emsg_token, message_class: 'alert-danger', roledata: '' });
                } else {
                    const hash_pwd = await bcrypt.hash(req.body.password, saltRounds)
                    const updata = await registerModel.updateOne({ email: email }, { $set: { password: hash_pwd } });
                    req.flash('emsg_token', 'Password sucessfully reset, kindy use new password to login.');
                    emsg_token = req.flash('emsg_token');
                    res.render('login', { message: emsg_token, message_class: 'alert-success', roledata: '' });
                }
            } else {
                req.flash('emsg_token', 'OTP not matched, please check your email or reprocess again.');
                emsg_token = req.flash('emsg_token');
                res.render('resetpassword', { message: emsg_token, message_class: 'alert-danger', roledata: '', role: role });
            }

        } else {
            req.flash('emsg_token', 'Invalid token');
            emsg_token = req.flash('emsg_token');
            res.render('resetpassword', { message: emsg_token, message_class: 'alert-danger', roledata: '', role: role });
        }


    }

    //let token = await

}
const getGoogleCallBack = async (req, res) => {
    const roledata = await roleModel.find({});
    const checkuser = await registerModel.findOne({ _id: req.user._id }).populate('role_id');
    if (checkuser.role_id == undefined || checkuser.role_id == '') {
        res.render('register', {
            checkuser: checkuser,
            roledata: roledata,
            message: req.flash('msg_category'),
            message_class: req.flash('msg_class'),
            asset_path: '../../'
        });
    } else {
   
        let rolename = checkuser.role_id.rolename;
        localStorage.setItem('userToken', JSON.stringify(checkuser.token));
        localStorage.setItem('userRole', JSON.stringify(rolename));

        /** Initialinse Empty value in Cookie to avoid undefine variable issue */
        res.cookie('UserName', "");
        res.cookie('Useremail', "");   
        res.cookie('image', "");
        /** Overwrite Cookie value */
        res.cookie('UserName', checkuser.username);
        res.cookie('Useremail', checkuser.email); 
        res.cookie('image', checkuser.image);       
        res.redirect('/admin');
        //req.flash('msg_category', 'Your email already registered,please sign in with Google');
        //req.flash('msg_class', 'alert-danger');
        //res.redirect("/getregister");
    }


}
const googleregister = async (req, res) => {
    const roleid = req.user.role_id;
    const mode = await registerModel.updateOne({ _id: req.user._id },
        {
            $set: {
                role_id: roleid

            }
        })
    res.redirect('/admin');
}

module.exports = {
    getDashboard,
    gettable,
    checkUserData,
    registerdata,
    getchart,
    getwidgets,
    getbutton,
    gettypography,
    getotherElement,
    dataUser,
    checkLogindata,
    getprofile,
    sendOtp,
    vaildtoken,
    getregister,
    getGoogleCallBack,
    googleregister
}