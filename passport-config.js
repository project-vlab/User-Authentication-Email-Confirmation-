// requiring local strategy, User model and bcrypt
const bcrypt = require('bcrypt');
const User = require('./models/user-model.js');
const LocalStrategy = require('passport-local').Strategy

function initializePassport(passport) {
    passport.use(new LocalStrategy({ usernameField: 'email'}, function(email, password, done) {
        //  checking User
        User.findOne({ email: email})
            .then(function(user) {
                if (!user) {
                    return done(null, false, { message: 'No user with this email'})
                }
                //  else
                
                bcrypt.compare(password, user.password, function(err, isMatch) {
                    if (err) {done(err);}
                    else {
                        if (isMatch) {
                           if (user.active === false ) return done(null, false)
                           return done(null, user)
                        } else {    // if password does not match
                            return done(null, false, { message: 'Incorrect Password'})
                        }
                    }
                })
            }).catch(function(err) {
                console.log(err);
            })

    }));
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        })
    })
}

module.exports = initializePassport;