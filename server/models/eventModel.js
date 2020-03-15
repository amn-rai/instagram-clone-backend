const mongoose = require("mongoose");

let event = mongoose.Schema({
  creator: { type: mongoose.Schema.ObjectId, ref: "user" },
  //  organizers: [{ type: mongoose.Schema.ObjectId, ref: "user" }],
  title: String,
  cover: String,
  description: String,
  coordinates: {
    type: [Number], // <lng, lat>
    index: { type: "2dsphere", sparse: false },
    required: true,
    default: [0, 0]
  }, //[lat,lng],
  categories: [{ type: mongoose.Schema.ObjectId, ref: "categories" }],
  location: String,
  city: {
    type: String
  },
  lat: {
    type: Number,
    default: 0
  },

  fee: {
    type: Number,
    default: 0
  },
  lng: {
    type: Number,
    default: 0
  },
  startdate: {
    type: Number

  },
  enddate: {
    type: Number
  },
  createdAt: {
    type: String
  }

});
event.set("toObject", { virtuals: true });
event.set("toJSON", { virtuals: true });

event.virtual("isFavourite", {
  ref: "eventfavourite",
  localField: "_id",
  foreignField: "event",
  count: true
});
event.virtual("favouriteCount", {
  ref: "favourite",
  localField: "_id",
  foreignField: "event",
  count: true
});
module.exports = mongoose.model("event", event);
