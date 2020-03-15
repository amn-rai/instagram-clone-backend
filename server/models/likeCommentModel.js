const mongoose = require('mongoose')

let likeComment = mongoose.Schema({
    user:{type:mongoose.Schema.ObjectId,required:true},
    comment:{type:mongoose.Schema.ObjectId,required:true},
    post:{type:mongoose.Schema.ObjectId,required:true},
    createdAt:{
        type:String,
        default:require('moment')().valueOf()
    }
})


module.exports = mongoose.model('likeComment',likeComment)