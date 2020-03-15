const mongoose = require("mongoose")
module.exports = mongoose.connect("mongodb://localhost:27017/peng",{ useUnifiedTopology: true ,useNewUrlParser:true, useFindAndModify: false  },function(err){
    if(err){
       return console.log("mongodb not connected",err)
    }
    console.log("mongodb  connected")
})