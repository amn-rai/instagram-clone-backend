const mongoose = require('mongoose')

let likeReply = mongoose.Schema({
    reply:{type:mongoose.Schema.ObjectId,required:true},
    user:{type:mongoose.Schema.ObjectId,required:true},
    post:{type:mongoose.Schema.ObjectId,required:true},
    createdAt:{
        type:String,
        default:require('moment')().valueOf()
    }
})

//
module.exports = mongoose.model('likeReply',likeReply)