const passport = require('passport')
const mongoose = require('mongoose');
const fs = require('fs');
const request = require('request');
const model = require("./registermodels")
var GoogleStrategy = require('passport-google-oauth20').Strategy;
async function downloadProfileImageAndUpdate(url, imagename, destination,id) {
  request(url)
    .pipe(fs.createWriteStream(destination))
    .on('close', async () => {
      console.log('Image downloaded successfully!');
      const mode = await model.updateOne({ _id: id },
        {
            $set: {
                image: imagename
                
            }
        })
    })
    .on('error', (err) => {
      console.error('Error downloading the image:', err);
    });
}

passport.serializeUser((user , done) => { 
  done(null , user); 
}) 
passport.deserializeUser(function(user, done) { 
  done(null, user); 
}); 
passport.use(new GoogleStrategy({
    clientID:"19376548750-am2fuuikpptnptv4nfkocpf7lpltc4gk.apps.googleusercontent.com",
    clientSecret:"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",
    callbackURL: "http://localhost:8004/auth/google/callback"
  },

  async function (accessToken, refreshToken, profile, cb)  {
  
    await model.findOrCreate({ email :profile._json.email, googleId: profile.id }, function (err, user,created) {
      
      if(created){
         
        let imagename = Date.now() + profile.id+'.png';
        let imagepath = './upload/'+imagename; 

        user.created = true;
        user.profile = profile;
        user.imagename = imagename;
        downloadProfileImageAndUpdate(profile._json.picture,imagename,imagepath,user._id);
        return cb(err, user);
      }else{
        user.created = false;
        console.log('Updated "%s"', user.googleId);
        return cb(err, user);
      }
            
    });
  }
));