//  STORE USER HASH
//  WILL BE NEEDED WHEN CONFIRMING A USER
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userHashedSchema = new Schema({
    userEmail: {
        type: String,
        required: true
    },
    hashedDoc: {
        type: String,
        required: true
    }
}, { timestamps: true });

const UserHash = mongoose.model('UserHash', userHashedSchema);
module.exports = UserHash;