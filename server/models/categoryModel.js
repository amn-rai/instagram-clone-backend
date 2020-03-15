const mongoose = require('mongoose')

let categories = mongoose.Schema({
    title:{type:String, unique:true,trim:true,required:true},
    deleted:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:String,
    }

})

categories.set("toObject",{virtuals:true})
categories.set("toJSON",{virtuals:true})

categories.virtual("postsCount",{
ref:"post",
localField:"_id",
foreignField:"categories",
count:true
})
module.exports = mongoose.model('categories',categories)