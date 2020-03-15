const mongoose = require("mongoose");

let reportcomment = mongoose.Schema({
  title: {
    type: String,
    default:"",
    trim: true
  },
  comment: { type: mongoose.Schema.ObjectId ,required:true },
  user: { type: mongoose.Schema.ObjectId ,required:true},
  createdAt: {
    type: String,
    default: require("moment")().valueOf()
  }
});

module.exports = mongoose.model("reportcomment", reportcomment);
