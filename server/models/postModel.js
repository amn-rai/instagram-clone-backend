const mongoose = require("mongoose");

let post = mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: "user" },
  area: { type: String },
  title: String,
  cover: String,
  description: String,
  isVideo: {
    type: Number,
    default: 0
  },
  isDraft: {
    type: Boolean,
    default: false
  },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "categories" }],
  tags: Array,
  coordinates: {
    type: [Number], // <lng, lat>
    index: { type: "2dsphere", sparse: false },
    required: true,
    default: [0, 0]
  }, //[lat,lng],
  lat: {
    types: Number,
    default: 0
  },
  lng: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: String,
    default: require("moment")().valueOf()
  },

});

post.set("toObject", { virtuals: true });
post.set("toJSON", { virtuals: true });

post.virtual("like", {
  ref: "likePost",
  localField: "_id",
  foreignField: "post",
  count: true
});


post.virtual("isLiked", {
  ref: "likePost",
  localField: "_id",
  foreignField: "post",
  count: true
});

post.virtual("comment", {
  ref: "postcomment",
  localField: "_id",
  foreignField: "post"
});
post.virtual("isFavourite", {
  ref: "favourite",
  localField: "_id",
  foreignField: "post",
  count: true
});
post.virtual("favouriteCount", {
  ref: "favourite",
  localField: "_id",
  foreignField: "post",
  count: true
});
module.exports = mongoose.model("post", post);
