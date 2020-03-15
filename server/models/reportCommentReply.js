const mongoose = require("mongoose");

let reportreply = mongoose.Schema({
  title: {
    type: String,
    default:"",
    trim: true
  },
  reply: { type: mongoose.Schema.ObjectId ,required:true },
  user: { type: mongoose.Schema.ObjectId ,required:true},
  createdAt: {
    type: String,
    default: require("moment")().valueOf()
  }
});

module.exports = mongoose.model("reportreply", reportreply);
