const mongoose = require('mongoose')
const moment = require('moment')

let user = mongoose.Schema({
    realname: { type: String },
    // email:{type:String,unique:true,lowercase: true,required:true },
    isMute: { type: Boolean, default: false },
    title: String,
    gender: String,
    birthday: String, // store in milliseconds
    username: { type: String, unique: true },
    we_id: { type: String },
    weibo_id: { type: String },
    phone: { type: String },
    password: { type: String },
    profilepic: { type: String, default: "" },
    deviceid: String,
    token: String,
    token: String,
    status: {
        type: Number, default: 1      // 0 for email is not verified 1 for email verified and active 2 for unaaproved by admin
    },
    address: String,
    street: String,
    experience: [String],
    zipcode: Number,
    deleted: {
        type: Boolean,
        default: false
    },
    commentPrivacy: {
        type: Boolean,
        default: false
    },
    tagPrivacy: {
        type: Boolean,
        default: false
    },
    messagePrivacy: {
        type: Boolean,
        default: false
    },
    accountType: {
        type: String,
        default: "public" //public and private
    },
    createdAt: {
        type: Number
    },
    badge: {
        type: Number,
        default: 0
    },
    lang: String
})

user.set("toObject", { virtuals: true });
user.set("toJSON", { virtuals: true });

user.virtual('followed', {
    ref: "follower",
    localField: "_id",
    foreignField: "user",
    count: true
})
user.virtual('following', {
    ref: "follower",
    localField: "_id",
    foreignField: "user",
    count: true
})
user.virtual('followers', {
    ref: "follower",
    localField: "_id",
    foreignField: "follower",
    count: true
})
user.virtual('posts', {
    ref: "post",
    localField: "_id",
    foreignField: "user",
    options: { limit: 4 }
})
user.virtual('postscount', {
    ref: "post",
    localField: "_id",
    foreignField: "user",
    count: true
})
module.exports = mongoose.model('user', user);