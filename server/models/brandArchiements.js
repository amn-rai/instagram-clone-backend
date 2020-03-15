const mongoose = require('mongoose')

let brandArchiements = mongoose.Schema({
    user:{type:mongoose.Schema.ObjectId},
    idType:{
        type:Number //1 for id 2 for foriegn password 3 for id of hong kong 4 for id of taiwan
    },
    realname:String,
    achievements: [{
        path: String,
        ext: String
    }],
    idNumber:String,
    trophies:String,
    createdAt:{
        type:String,
        default:require('moment')().valueOf()
    }
})
module.exports = mongoose.model('brandArchiements',brandArchiements)