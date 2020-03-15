const mongoose = require('mongoose')

let brand = mongoose.Schema({
    user: { type: mongoose.Schema.ObjectId },
    name: { type: String },
    status: {
        type: String,
        default: "unapproved"  //approved
    },
    address: { type: String },
    contact: { type: String },
    emailOrPhone: { type: String },
    documents: [{
        path: String,
        ext: String
    }],
    createdAt: {
        type: String,
        default: require('moment')().valueOf()
    }
})
module.exports = mongoose.model('brandAuth', brand)