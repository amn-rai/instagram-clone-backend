const mongoose = require('mongoose')

let favourite = mongoose.Schema({
    user:{type:mongoose.Schema.ObjectId,ref:"user"},
    post:{type:mongoose.Schema.ObjectId,ref:"post"},
    createdAt:{
        type:String,
        default:require('moment')().valueOf()
    }
})
module.exports = mongoose.model('favourite',favourite)