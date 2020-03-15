const mongoose = require('mongoose')
let blockuser = mongoose.Schema({
    blocked:{type:mongoose.Schema.ObjectId},
    blockedBy:{type:mongoose.Schema.ObjectId},
    createdAt:{type:String, default:require('moment')().valueOf()}
})
module.exports = mongoose.model('blockuser',blockuser)