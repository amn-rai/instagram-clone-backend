const mongoose = require('mongoose')

let draft = mongoose.Schema({
    title:{
        type:String,
        unique:true,
        trim:true,
        required:true
    },
    deleted:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:String,
    }

})

module.exports = mongoose.model('draft',draft)