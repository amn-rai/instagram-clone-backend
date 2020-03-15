const mongoose = require('mongoose')

let followerRequest = mongoose.Schema({
    user:{type:mongoose.Schema.ObjectId},
    follower:{type:mongoose.Schema.ObjectId},
    createdAt:{
        type:String,
        default: new Date().getDate()
    }
})

followerRequest.set("toObject", { virtuals: true });
followerRequest.set("toJSON", { virtuals: true });

followerRequest.virtual("isFollowedByMe", {
  ref: "follower",
  localField: "user",
  foreignField: "follower",
  count: true
});
module.exports = mongoose.model('followerRequest',followerRequest)