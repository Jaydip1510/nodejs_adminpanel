const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/registermodels');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing

const localization = (passport) => {
    passport.use(
      new LocalStrategy(async (username, password, done) => {
        console.log(username + " " + password)
        let userdata = await User.findOne({ name: username });
        console.log(userdata)
        try {
          if (!userdata) return done(null, false);
          if (!bcrypt.compare(password, userdata.password)) {
            console.log("bcryot blocked");
            // If the passwords don't match, return 'false' to indicate failed authentication
            // Also, include a message that will be available to handle authentication failure on the client side
            return done(null, false, { message: 'Incorrect email or password' });
          }
          // if (userdata.password !== password) return done(null, false);
           return done(null, userdata);
        } catch (error) {
          console.log("catch blocked");
          return done(error, false);
        }
      })
    );
  
    passport.serializeUser((user, done) => {
      done(null, user.id);
    });
  
    passport.deserializeUser(async (id, done) => {
      let data = await User.findOne({id});
      done(null, data);
    });
  }
  
  
  module.exports = localization;
  