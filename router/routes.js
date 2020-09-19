const User = require('./../models/user-model.js');
const UserHash = require('./../models/user-hash.js');
const express = require('express');
const router = express.Router();


router.get('/:id', async function(req, res) {
    console.log(req.params.id);
    //  checking if the user has been activated
    var user = await User.findById(req.params.id);
    if (user.active == false) {
        res.render('confirm.ejs');
    }
})


//  this will validate the user

router.get('/val/:hash', async function(req, res) {
    //  searching the UserHash model
    const userHash = await UserHash.findOne({ hashedDoc: req.params.hash});
    if (!userHash) {
        res.send('No such user found')
    } else {
        var user = await User.findOne({ email: userHash.userEmail});
        //  checking the active role
        if (user.active == true) {
            res.send("Your account has already been validated")
        } else {
            user.active = true;
            try {
                user = await user.save();
                res.send('Successful')
            } catch {
                console.log('Failed')
            }

        }
    }
})

module.exports = router;