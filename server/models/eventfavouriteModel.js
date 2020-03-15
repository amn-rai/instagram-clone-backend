const mongoose = require('mongoose')
let eventfavourite = mongoose.Schema({
    user:{type:mongoose.Schema.ObjectId,ref:"user"},
    event:{type:mongoose.Schema.ObjectId},
    createdAt:String
})
module.exports = mongoose.model('eventfavourite',eventfavourite)