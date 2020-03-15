const mongoose = require('mongoose')

let likePost = mongoose.Schema({
    post:{type:mongoose.Schema.ObjectId,required:true},
    user:{type:mongoose.Schema.ObjectId,required:true},
    createdAt:{
        type:String,
        default:require('moment')().valueOf()
    }
})
module.exports = mongoose.model('likePost',likePost)