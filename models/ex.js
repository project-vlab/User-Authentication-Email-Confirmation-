const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const exampleUser = new Schema({
    name: {
        type: String,
        require: true
    },
    role: {
        type: String,
        default: "Student"
    }
}, { timestamps: true })
const Roler = mongoose.model('Roler', exampleUser);
module.exports = Roler;