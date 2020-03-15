const mongoose = require("mongoose");
const moment = require("moment");

let admin = mongoose.Schema({
  email: { type: String, unique: true },
  name: { type: String },
  admin: { type: Number, default: 0 }, // 1 for super admin 0 fro sub admin
  password: { type: String },
  profilepic: { type: String, default: "" },
  token: String,
  status: { type: Number, default: 1 },
  //permitions
  user_read: { type: Boolean, default: false },
  user_write: { type: Boolean, default: false },
  user_delete: { type: Boolean, default: false },
  comment_read: { type: Boolean, default: false },
  comment_write: { type: Boolean, default: false },
  comment_delete: { type: Boolean, default: false },
  notification_read: { type: Boolean, default: false },
  notification_write: { type: Boolean, default: false },
  analytics_read: { type: Boolean, default: false },
  reports_read: { type: Boolean, default: false },
  address: String,
  street: String,
  zipcode: Number,
  createdAt: {
    type: String,
    default: moment().valueOf()
  }
});
module.exports = mongoose.model("admin", admin);
