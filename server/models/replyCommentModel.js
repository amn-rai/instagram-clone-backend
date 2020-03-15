const mongoose = require('mongoose')

let replyComment = mongoose.Schema({
    comment:{type:mongoose.Schema.ObjectId,required:true},
    user:{type:mongoose.Schema.ObjectId,required:true,ref:'user'},
    text:{type:String, required:true},
    createdAt:{
        type:String,
        default:require('moment')().valueOf()
    }
})

replyComment.set("toObject", { virtuals: true });
replyComment.set("toJSON", { virtuals: true });
replyComment.virtual("isCommentReplyLiked", {
    ref: "likeReply",
    localField: "_id",
    foreignField: "reply",
    count: true
  });
  replyComment.virtual("commentReplyLikeCount", {
    ref: "likeReply",
    localField: "_id",
    foreignField: "reply",
    count:true
  });

module.exports = mongoose.model('replyComment',replyComment)