const mongoose = require("mongoose");

let reportpost = mongoose.Schema({
  title: {
    type: String,
    default:"",
    trim: true
  },
  post: { type: mongoose.Schema.ObjectId ,required:true },
  user: { type: mongoose.Schema.ObjectId ,required:true},
  createdAt: {
    type: String,
    default: require("moment")().valueOf()
  }
});

module.exports = mongoose.model("reportpost", reportpost);
