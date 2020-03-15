const mongoose = require('mongoose')

let follower = mongoose.Schema({
    user: { type: mongoose.Schema.ObjectId, ref: "user" },
    follower: { type: mongoose.Schema.ObjectId, ref: "user" },
    createdAt: {
        type: String,
        default: require('moment')().valueOf()
    }
})
module.exports = mongoose.model('follower', follower)