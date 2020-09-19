//  REQUIRING NECESSARY MODULES
const mongoose = require('mongoose');
const User = require('./models/user-model.js');

User.find()
    .then(function(result) {
        console.log(result);
    }).catch(function(err) {
        console.log(err);
    })