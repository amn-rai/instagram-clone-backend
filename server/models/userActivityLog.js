const mongoose = require('mongoose')
let userActivityLog = mongoose.Schema({
    user:{type:mongoose.Schema.ObjectId},
    action:String,
    createdAt:String
})
module.exports = mongoose.model('userActivityLog',userActivityLog)