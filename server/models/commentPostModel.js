const mongoose = require("mongoose");

let comment = mongoose.Schema({
  post: { type: mongoose.Schema.ObjectId, required: true },
  user: { type: mongoose.Schema.ObjectId, required: true, ref: "user" },
  text: { type: String, required: true },
  createdAt: {
    type: String,
    default:  require("moment")().valueOf()
  }
});

comment.set("toObject", { virtuals: true });
comment.set("toJSON", { virtuals: true });

comment.virtual("commentLike", {
  ref: "likeComment",
  localField: "_id",
  foreignField: "comment",
  count: true
});

comment.virtual("commentReply", {
  ref: "replyComment",
  localField: "_id",
  foreignField: "comment"
});


comment.virtual("isCommentLiked", {
    ref: "likeComment",
    localField: "_id",
    foreignField: "comment",
    count: true
  });

module.exports = mongoose.model("postcomment", comment);
