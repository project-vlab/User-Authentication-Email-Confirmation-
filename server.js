//  REQUIRING NECESSARY MODULES
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const User = require('./models/user-model.js');
const UserHash = require('./models/user-hash.js');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const checkRouter = require('./router/routes.js');
const passport = require('passport');
const session = require('express-session');
const express = require('express');
const methodOverride = require('method-override');
const app = express();
require('dotenv').config();
const initializePassport = require('./passport-config.js');
initializePassport(passport);
app.use(session({
    secret: 'secret',
    resave: false,  // find out what these two do
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

app.use(express.urlencoded({ extended: false }));
app.set('view-engine', 'ejs');

var message = '';

// database url
dbURI = process.env.MONGO_URI;
// connecting to database
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(function(result) {
        console.log('Connected!');
        app.listen(5000);
    }).catch(function(err) {
        console.log(err);
    });

app.use('/api/users', checkRouter);

// this function checks if an object is empty or not
// returns true if empty
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.MAIL,
        pass: process.env.MAIL_PASS
    }
});



app.get('/profile', checkAuthenticated, function(req, res) {
    //res.send(req.user);
    const userData = req.user
    res.render('profile.ejs', { userData: userData })
})
// @route GET /
// @description: about page
app.get('/', checkAuthenticated, function(req, res) {
    res.render('about.ejs')
})

//@route GET /login
app.get('/login', checkNotAuthenticated, function(req, res) {
    res.render('login.ejs')
});
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: false
}))

// @route GET /register
app.get('/register', checkNotAuthenticated, function(req, res) {
    res.render('register.ejs', { message: message });
});

// POST /register
// description: registering the user
app.post('/register', checkNotAuthenticated, function(req, res) {
    async function registerUser() {
        // register user
        try {
            console.log('okay');
            const hashedPassword = await bcrypt.hash(req.body.pw, 10);
            console.log(hashedPassword);
            console.log('this point')
            var user = new User({
                firstName: req.body.fName,
                lastName: req.body.lName,
                email: req.body.email,
                user: req.body.user,
                password: hashedPassword
            });
            console.log('okay')
            user = await user.save();
            console.log(user);

            //  creating a hashed link
            //  this copy of the document will be deleted once the user
            //  validates the email
            const hashed_link = crypto.randomBytes(32).toString('hex');
            var userHash = new UserHash({
                userEmail: req.body.email,
                hashedDoc: hashed_link
            });
            userHash = await userHash.save();
            console.log(userHash);
            
            // now sending a confirmation link
            let mailOptions = {
                from: process.env.MAIL,
                to: user.email,
                subject: 'Confirm your email by clicking this link',
                text: 'http://localhost:5000/api/users/val/' + (hashed_link).toString()
            };
            transporter.sendMail(mailOptions, function(err, info) {
                if (err) {
                    console.log(err)
                } else {
                    res.redirect('/api/users/' + user.id);
                }
            })
           
        } catch {
            res.redirect('/register');
        }
    }
    //  first check if a user with the same email exists
    User.findOne({ email: req.body.email })
        .then(function(result) {
            const regUser = isEmpty(result);
            //  if there is no user, regUser will return true, otherwise false
            if (regUser == false) {
                // will redirect to register again
                message = "User with email already exists";
                res.redirect('/register');
            } else {
                // otherwise register the user
                registerUser();
            }
        })
});
app.delete('/logout', function(req, res) {
    req.logOut();
    res.redirect('/login');
})

//  route control middleware
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next();
}

