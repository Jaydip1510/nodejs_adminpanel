const express = require('express');
const initializingPassport = require('./controllers/passportconfig');
const app = express();
const routes = require('./routes/user');
const cookie = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const bodyParser = require('body-parser');
const localization = require('./middeleware/localauth');
app.use(cookie());
app.use(session({secret:"secret-key",resave:true,saveUninitialized:true}));

localization(passport);
var LocalStorage = require('node-localstorage').LocalStorage,
localStorage = new LocalStorage('./scratch');

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'testSecret',
    resave: false,
    saveUninitialized: false,
  }));

 app.set('view engine','ejs');
 app.use(express.static(__dirname));

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(flash());
app.use(routes);

app.get('/',(req,res)=>{
    res.render("login",{ message:''});
})

app.get('/login',(req,res)=>{
    res.render("login",{ message: ''});
})

// app.get('/profile',(req,res)=>{
//     res.render("profile",{ username:'jaydip123',selected:'profile'});
// })

app.get('/logout', (req, res) => {
    localStorage.clear();
    res.clearCookie('UserName');
    res.clearCookie('Useremail');
    res.redirect('/');

})


app.listen(8004,"127.0.0.1",()=>{
    console.log("listening port in 8004...");
})