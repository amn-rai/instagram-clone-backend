const userModel = require("../../models/userModel");
const categoryModel = require("../../models/categoryModel");
const followModel = require("../../models/followModel");
const followRequestModel = require("../../models/followRequestModel");
const postModel = require("../../models/postModel");
const postLike = require("../../models/likepostModel");
const postComment = require("../../models/commentPostModel");
const likeComment = require("../../models/likeCommentModel");
const replyComment = require("../../models/replyCommentModel");
const blockUserModel = require("../../models/blockUserModel");
const likeReply = require("../../models/likeReplyModel");
const reportPost = require("../../models/reportPost");
const reportComment = require("../../models/reportComment");
const reportCommentReply = require("../../models/reportCommentReply");
const postfavouriteModel = require("../../models/postfavouriteModel");
const userActivityLogModel = require("../../models/userActivityLog");
const brandAuthModel = require("../../models/brandAuthModel");
const brandAchievementsModel = require("../../models/brandArchiements");
const messageModel = require("../../models/message");
const constant = require("../../constant");
const moment = require("moment");
const nodeMailer = require("nodemailer");
const sgTransport = require("nodemailer-sendgrid-transport");
const bcrypt = require("../../common/bcryp");
const commonHandler = require("../../common/commonHandler");
const fs = require("fs");
const mongoose = require("mongoose");
const path = require("path");
const groupModel = require('../../models/group')
const ffmpeg = require('fluent-ffmpeg')
const noficationController = require("../../common/notificationController")
const nofication = require("../../models/notification")
const Constant = require('../../constants/constant')
const notif = new noficationController()
const ENCONSTANT = require("../../lib/language/en");
const CHCONSTANT = require("../../lib/language/sp");
let CONSTANT = {};


const _ = require("underscore");
class UserController {
  register(body, file) {
    return new Promise((resolve, reject) => {
      let query = {};
      if (body.we_id) {
        query.we_id = body.we_id;
      }
      if (body.lang == "en")
        CONSTANT = ENCONSTANT
      else {
        CONSTANT = CHCONSTANT
      }
      if (body.weibo_id) {
        query.weibo_id = body.weibo_id;
      }
      if (Object.keys(query).length == 0) {
        return reject(CONSTANT.MISSINGPARAMS);
      }
      userModel.findOne(query).then(
        async result => {
          if (result) return resolve(result);
          let user = new userModel({
            realname: body.realname,
            title: body.title,
            experience: body.experience,
            gender: body.gender,
            we_id: body.we_id,
            weibo_id: body.weibo_id,
            birthday: body.birthday,
            profilepic: file ? "/static/users/" + file.filename : "",
            deviceid: body.deviceid,
            createdAt: moment().valueOf()
          });
          user.username = await this.generateUsername(body.realname);
          user.save().then(
            result => {
              resolve(result);
            },
            err => {
              reject(commonHandler.mongoErrorHandler(err));
            }
          );
        },
        err => {
          reject(err);
        }
      );
    });
  }
  //remove spaces generate random number
  registerWithPhone(body, file) {
    return new Promise(async (resolve, reject) => {
      if (body.lang == "en")
        CONSTANT = ENCONSTANT
      else {
        CONSTANT = CHCONSTANT
      }
      if (!(body.phone)) { return reject(CONSTANT.MISSINGNAMEPHONE) }
      let phoneCheck = await userModel.findOne({ phone: body.phone })
      if (phoneCheck) { return reject(CONSTANT.PHONEEXIST) }
      let user = new userModel({
        realname: body.realname,
        // email: Body.email,
        experience: body.experience,// added later
        title: body.title,
        gender: body.gender,
        user: body.username,
        phone: body.phone,
        username: body.username,
        // password: bcrypt.hashPassword(body.password),
        birthday: body.birthday,
        profilepic: file ? "/static/users/" + file.filename : "",
        deviceid: body.deviceid,
        createdAt: moment().valueOf(),

      });
      if (!body.username) {
        user.username = await this.generateUsername(body.realname);
      }
      user.save((err, result) => {
        if (err) return reject(commonHandler.mongoErrorHandler(err));
        resolve(result);
      });
    });
  }
  async generateUsername(realname) {
    realname = realname ? realname : "user";
    let username = `${realname.replace(/ /g, "").toLowerCase()}${Math.ceil(
      Math.random() * 1000000
    )}`;
    let valid;
    try {
      valid = await userModel.findOne({ username: username });
    } catch (err) { }
    if (valid) this.generateUsername(realname);
    else return username.trim();
  }
  login(body) {
    return new Promise((resolve, reject) => {
      if (body.lang == "en")
        CONSTANT = ENCONSTANT
      else {
        CONSTANT = CHCONSTANT
      }
      userModel.findOne({ phone: body.phone }).then(
        result => {
          if (!result) return reject(CONSTANT.PHONENOTEXIST);
          // if (bcrypt.compareHash(body.password, result.password)) { //as client removed this functionalty of password
          userModel
            .findOneAndUpdate({ deviceid: body.deviceid }, { deviceid: "" })
            .then(user => {
              userModel
                .findByIdAndUpdate(result._id, {
                  deviceid: body.deviceid
                })
                .then(
                  res => {
                    resolve(result);
                  },
                  err => {
                    reject(err);
                  }
                );
            });
          // } else {
          //   reject("Password is incorrect.");
          // }
        },
        err => {
          reject("error" + err);
        }
      );
    });
  }

  updateUser(id, body, file) {
    return new Promise((resolve, reject) => {
      if (file) {
        body.profilepic = "/static/users/" + file.filename;
      }
      // body.birthday = moment(body.birthday, "DD-MM-YYYY").format("x")
      userModel
        .findByIdAndUpdate(id, body, { new: true, runValidators: true })
        .then(
          async res => {
            if (res) {
              await this.addToActivityLog({ action: constant.ACTIVITYPROFILE, user: id })
              resolve(res);
            }
            else {
              reject("User not found")
            }
          },
          err => {
            reject(commonHandler.mongoErrorHandler(err));
          }
        );
    });
  }
  changePassword(body, hash) {
    return new Promise((resolve, reject) => {
      if (body.lang == "en")
        CONSTANT = ENCONSTANT
      else {
        CONSTANT = CHCONSTANT
      }
      userModel.findOne({ phone: body.phone }).then(
        result => {
          if (!result)
            return reject(CONSTANT.USERNOPHONE);
          if (bcrypt.compareHash(body.oldPassword, result.password)) {
            userModel
              .findByIdAndUpdate(result._id, { password: hash.password })
              .then(
                async res => {
                  await this.addToActivityLog({ action: constant.ACTIVITYPASSWORD, user: result._id })
                  resolve(CONSTANT.PASSWORDUPDATESUCCESS);
                },
                err => {
                  reject(err);
                }
              );
          } else {
            reject(CONSTANT.INCORRECTPASS);
          }
        },
        err => {
          reject(err);
        }
      );
    });
  }

  getUser(body) {
    return new Promise((resolve, reject) => {
      //.populate('favouriteStores')
      if (body.lang == "en")
        CONSTANT = ENCONSTANT
      else {
        CONSTANT = CHCONSTANT
      }
      userModel
        .findById(body.profileuser)
        .populate({
          path: "followed",
          modelName: "follower",
          match: { follower: body.loggedinuser ? body.loggedinuser : null }
        })
        .populate({
          path: "following",
          modelName: "follower"
        })
        .populate({
          path: "followers",
          modelName: "follower"
        })
        .then(
          result => {
            if (!result) reject(CONSTANT.NOUSER);
            else {
              resolve(result);
            }
          },
          err => {
            reject(err);
          }
        );
    });
  }
  // working fine
  userLogout(id) {
    return new Promise((resolve, reject) => {
      userModel.findByIdAndUpdate(id, { deviceid: "" }).then(
        result => {
          resolve(result);
        },
        err => {
          reject(err);
        }
      );
    });
  }
  forgetPassword(body) {
    return new Promise((resolve, reject) => {
      if (body.lang == "en")
        CONSTANT = ENCONSTANT
      else {
        CONSTANT = CHCONSTANT
      }
      userModel
        .findOneAndUpdate(
          { phone: body.phone },
          { password: bcrypt.hashPassword(body.password) }
        )
        .then(
          user => {
            resolve(CONSTANT.PASSWORDUPDATESUCCESS);
          },
          err => {
            reject(err);
          }
        );
    });
  }
  getCategories() {
    return new Promise((resolve, reject) => {
      if (body.lang == "en")
        CONSTANT = ENCONSTANT
      else {
        CONSTANT = CHCONSTANT
      }
      categoryModel
        .find({ deleted: false })
        .sort({ date: -1 })
        .then(
          result => {
            if (!result) reject(CONSTANT.ADDCAT);
            else {
              resolve(result);
            }
          },
          err => {
            reject(err);
          }
        );
    });
  }
  checkPhone(body) {
    let { phone, we_id } = body
    let qry = {}
    if (phone) {
      qry.phone = phone
    }
    if (we_id) {
      qry.we_id = we_id
    }
    if (phone && we_id) {
      qry.we_id = we_id
      qry.phone = phone

    }
    console.log(qry);

    return new Promise((resolve, reject) => {
      userModel.findOne(qry).then(
        result => {
          if (result) return resolve();
          reject();
        },
        err => {
          reject(err);
        }
      );
    });
  }
  addCategory(body, file) {
    return new Promise((resolve, reject) => {
      if (body.lang == "en")
        CONSTANT = ENCONSTANT
      else {
        CONSTANT = CHCONSTANT
      }
      var regex = new RegExp("^" + body.title + "$", "ig");
      categoryModel.findOne({ title: regex, deleted: false }).then(
        result => {
          if (result) {
            return reject(CONSTANT.CATEXIST);
          }
          let category = new categoryModel({
            title: body.title,
            date: moment().valueOf()
          });
          category.save(err => {
            if (err) {
              return reject(err);
            }
            resolve(CONSTANT.CATADDSUCCESS);
          });
        },
        err => {
          reject(err);
        }
      );
    });
  }
  getCategories() {
    return new Promise((resolve, reject) => {
      categoryModel.find({ deleted: false }).then(
        categories => {
          resolve(categories);
        },
        err => {
          reject(err);
        }
      );
    });
  }
  followUser(body) {
    return new Promise((resolve, reject) => {
      if (body.lang == "en")
        CONSTANT = ENCONSTANT
      else {
        CONSTANT = CHCONSTANT
      }
      let query = { user: body.user, follower: body.follower };
      followModel.findOne(query).then(
        result => {
          if (result) {
            followModel.deleteOne(query).then(res => {
              resolve({ followed: 0, message: CONSTANT.USERUNFOLLOWL });
            });
          } else {
            let follower = new followModel(query);
            follower.save(err => {
              if (err) return reject(err);
              resolve({ followed: 1, message: CONSTANT.USERFOLLOW });
            });
          }
        },
        err => {
          reject(err);
        }
      );
    });
  }
  getRecommended() {
    return new Promise((resolve, reject) => {
      userModel.find({ recommended: 1 }).then(
        users => {
          resolve(users);
        },
        err => {
          reject(err);
        }
      );
    });
  }
  createPost(body, files, data) {
    return new Promise((resolve, reject) => {
      let cover = ""
      if (files.cover) {
        cover = `/static/posts/cover-${files.cover[0].originalname}`
      }
      // console.log('POST body', body);


      let post = new postModel({
        title: body.title,
        area: body.area,
        categories: JSON.parse(body.categories),
        tags: JSON.parse(body.tags),
        user: body.user,
        isVideo: body.isVideo,
        coordinates: [Number(body.lng), Number(body.lat)], // for geofencing queries
        lat: body.lat,
        lng: body.lng,
        description: body.description,
        createdAt: moment().valueOf(),
        isDraft: body.isDraft,
        cover
      });
      post.save((err, result) => {
        if (err) {
          console.log(err);

          return reject(err);
        }
        // fs.appendFile(
        //   `./server/uploads/posts/description/${result._id}.txt`,
        //   body.description,
        //   async      res => {
        //     await this.addToActivityLog({ action: constant.ACTIVITYPOST + `<a routerlink='${constant.ACTIVITYURL + result._id}' > post </a>`, user: result._id })

        //     resolve(result);
        //   }
        // );
        followModel.find({ user: body.user }).populate('follower').then(user => {
          let followers_device_IDS = []
          let followers_user_IDS = []
          user.map(follower => {

            followers_device_IDS.push(follower.follower.deviceid);
            followers_user_IDS.push(follower.follower._id);

          })



          notif.sendUserNotification(followers_device_IDS, followers_user_IDS, null, null, 0, body.name, result.id, null, body.lang)
        })

        resolve(result)
      });
    });
  }
  getSinglePost(body) {
    return new Promise(async (resolve, reject) => {
      body.user = body.user ? body.user : null
      postModel
        .findOne({ _id: body.post })
        .populate({ path: "categories", select: "-deleted" })
        .populate({ path: "like" })
        .populate({ path: "isLiked", match: { user: body.user } })
        .populate({ path: "isFavourite", match: { user: body.user } })
        .populate({ path: "favouriteCount" })
        .populate({
          path: "user",
          select: "realname profilepic username title commentPrivacy tagPrivacy messagePrivacy",
          populate: {
            path: "followed",
            model: "follower",
            match: { follower: body.user }
          }
        })
        .populate({
          path: "comment",
          populate: [
            { path: "commentLike", modelName: "commentLike" },
            {
              path: "isCommentLiked",
              modelName: "commentLike",
              match: { user: body.user }
            },
            { path: "user", select: "realname profilepic username title" },
            {
              path: "commentReply",
              modelName: "commentReply",
              populate: [
                { path: "user", select: "realname profilepic username title" },
                {
                  path: "isCommentReplyLiked",
                  modelName: "likeReply",
                  match: { user: body.user }
                },
                { path: "commentReplyLikeCount", modelName: "likeReply" }
              ]
            }
          ]
        })
        .then(
          result => {
            if (result) {
              // result.description = this.getPostDescription(result._id);
              // console.log(
              //   "getPostDescription(result._id)",
              //   this.getPostDescription(result._id)
              // );

              resolve(result);
            } else {
              reject("something went wrong pls try again later");
            }
          },
          err => {
            reject(err);
          }
        );
    });
  }
  getPosts(body) {
    return new Promise(async (resolve, reject) => {
      let skip = 0;
      if (Number(body.skip)) skip = body.skip;
      let qry = {};
      body.user = body.user ? body.user : null
      body.userIdForSingle = body.userIdForSingle ? body.userIdForSingle : null
      if (body.user) {
        console.log("i ma here");

        qry.user = body.user;
      }
      let pipeline = [];
      if (body.userIdForSingle) {
        console.log(" iside userIdForSingle true");
        pipeline.push({
          $match: {
            user: mongoose.Types.ObjectId(body.userIdForSingle)
          }
        });
      }
      pipeline = pipeline.concat([
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user"
          }
        },
        {
          $unwind: "$user"
        },
        {
          $lookup: {
            from: "followers",
            localField: "user._id",
            foreignField: "user",
            as: "followers"
          }
        },
        {
          $match: {
            "user.accountType": "public",
            isDraft: false
          }
        }
      ]);
      if (body.category) {
        body.category.forEach((category, i) => {
          body.category[i] = mongoose.Types.ObjectId(category);
        });
        pipeline.push({ $match: { categories: { $in: body.category } } });
      }
      if (body.query) {
        pipeline.push({
          $match: {
            $or: [
              { title: { $regex: body.query, '$options': 'i' } },
              { "user.realname": { $regex: body.query, '$options': 'i' } }
            ]
          }
        });
      }
      if (body.user) {
        pipeline = [
          {
            $match: {
              user: { $nin: [body.user] }
            }
          },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "user"
            }
          },
          {
            $unwind: "$user"
          },
          {
            $lookup: {
              from: "followers",
              localField: "user._id",
              foreignField: "user",
              as: "followers"
            }
          },
          {
            $match: {
              $or: [
                { "user.accountType": "public" },
                { "followers.follower": body.user }
              ]
            }
          },
          {
            $project: {
              categories: 1,
              tags: 1,
              title: 1,
              cover: 1,
              "user._id": 1,
              "user.username": 1,
              "user.realname": 1,
              "user.profilepic": 1
            }
          }
          //
        ];
      }
      let subPipeline = [
        {
          $lookup: {
            from: "likeposts",
            localField: "_id",
            foreignField: "post",
            as: "likes"
          }
        },
        {
          $project: {
            categories: 1,
            tags: 1,
            title: 1,
            cover: 1,
            "user._id": 1,
            "user.username": 1,
            "user.realname": 1,
            "user.profilepic": 1,
            like: { $size: "$likes" },
            liked: {
              $filter: {
                input: "$likes",
                as: "isLiked",
                cond: {
                  $eq: [mongoose.Types.ObjectId(body.user), "$$isLiked.user"]
                }
              }
            }
          }
        }
      ];
      if (body.userIdForSingle && body.user) {
        pipeline.push({
          $match: {
            "user._id": mongoose.Types.ObjectId(body.userIdForSingle)
          }
        });
      }
      subPipeline.push({
        $project: {
          categories: 1,
          tags: 1,
          title: 1,
          cover: 1,
          like: 1,
          "user._id": 1,
          "user.username": 1,
          "user.realname": 1,
          "user.profilepic": 1,
          isLiked: { $size: "$liked" }
        }
      });
      pipeline = pipeline.concat(subPipeline);

      const pipeline1 = pipeline.concat([
        { $skip: skip },
        { $limit: constant.PERPAGE },
        { $sort: { _id: -1 } }
      ]);

      const pipeline2 = pipeline.concat([
        {
          $group: {
            _id: null,
            count: { $sum: 1 }
          }
        }
      ]);
      // console.log("pipeline", JSON.stringify(pipeline, null, 2));
      let totalposts = await postModel.aggregate(pipeline2);
      console.log("totalposts", totalposts);
      totalposts = totalposts.length > 0 ? totalposts[0].count : 0;

      postModel.aggregate(pipeline1).then(posts => {
        resolve({
          posts,
          totalpages: Math.ceil(totalposts / constant.PERPAGE),
          postCount: totalposts
        });
      });
    });
  }
  //get posts following and search in post title and in user realname
  getPostsFollowed(body) {
    return new Promise(async (resolve, reject) => {
      if (!body.loggedInUser) {
        return reject("loggedInUser is required");
      }
      let skip = 0;
      if (Number(body.skip)) skip = body.skip;
      let qry = {};
      let sort = { _id: -1 };
      if (Number(body.date)) sort = { _id: 1 };
      let follower = [];
      let followers = await followModel.find(
        { follower: body.loggedInUser },
        "user"
      );
      followers.forEach(f => {
        follower.push(mongoose.Types.ObjectId(f.user));
      });
      let blockedusers = [];
      let blockeduserss = await blockUserModel.find({
        $or: [
          { blocked: mongoose.Types.ObjectId(body.loggedInUser) },
          { blockedBy: mongoose.Types.ObjectId(body.loggedInUser) }
        ]
      });
      blockeduserss.forEach(f => {
        blockedusers.push(mongoose.Types.ObjectId(f.blocked));
        blockedusers.push(mongoose.Types.ObjectId(f.blockedBy));
      });
      console.log("blocked", blockedusers);

      console.log("following", follower);
      let pipeline = [
        {
          $match: {
            user: { $in: follower },
            // isDraft: false   made change by Pawan
          }
        },
        {
          $match: {
            user: { $nin: blockedusers }
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user"
          }
        },
        {
          $unwind: "$user"
        }
      ];
      if (body.query) {
        let query1 = new RegExp(body.query, "i");
        pipeline.push({
          $match: {
            $or: [
              { title: { $regex: query1, '$options': 'i' } },
              { "user.realname": { $regex: query1, '$options': 'i' } }
            ]
          }
        });
      }
      if (body.category) {
        body.category.forEach((category, i) => {
          body.category[i] = mongoose.Types.ObjectId(category);
        });
        pipeline.push({ $match: { categories: { $in: body.category } } });
      }
      let subPipeline = [
        {
          $lookup: {
            from: "likeposts",
            localField: "_id",
            foreignField: "post",
            as: "likes"
          }
        },
        {
          $project: {
            // categories: 1,
            // tags: 1,
            title: 1,
            cover: 1,
            "user._id": 1,
            "user.username": 1,
            "user.realname": 1,
            "user.profilepic": 1,
            like: { $size: "$likes" },
            liked: {
              $filter: {
                input: "$likes",
                as: "isLiked",
                cond: {
                  $eq: [
                    mongoose.Types.ObjectId(body.loggedInUser),
                    "$$isLiked.user"
                  ]
                }
              }
            }
          }
        },
        {
          $project: {
            // categories: 1,
            // tags: 1,
            title: 1,
            cover: 1,
            like: 1,
            "user._id": 1,
            "user.username": 1,
            "user.realname": 1,
            "user.profilepic": 1,
            isLiked: { $size: "$liked" }
          }
        }
      ];

      pipeline = pipeline.concat(subPipeline);

      const pipeline1 = pipeline.concat([
        { $skip: skip },
        { $limit: constant.PERPAGE },
      ]);

      const pipeline2 = pipeline.concat([
        {
          $group: {
            _id: null,
            count: { $sum: 1 }
          }
        }
      ]);
      // console.log("pipeline", JSON.stringify(pipeline1, null, 2));
      let totalposts = await postModel.aggregate(pipeline2);
      console.log("totalposts", totalposts);
      totalposts = totalposts.length > 0 ? totalposts[0].count : 0;
      postModel.aggregate(pipeline1).then(posts => {
        resolve({
          posts,
          totalpages: Math.ceil(totalposts / constant.PERPAGE),
          postCount: totalposts
        });
      });
    });
  }
  getPostsNearBy(body) {
    return new Promise(async (resolve, reject) => {
      let skip = 0;
      body.loggedInUser =
        body.loggedInUser != ""
          ? mongoose.Types.ObjectId(body.loggedInUser)
          : null;
      if (!(body.lng && body.lat)) {
        return reject("pls provide lat lng ");
      }
      if (Number(body.skip)) skip = body.skip;
      let blockedusers = [];
      // if( body.loggedInUser){
      //    blockedusers = [body.loggedInUser]
      // }
      let blockeduserss = await blockUserModel.find({
        $or: [{ blocked: body.loggedInUser }, { blockedBy: body.loggedInUser }]
      });
      blockeduserss.forEach(f => {
        blockedusers.push(mongoose.Types.ObjectId(f.blocked));
        blockedusers.push(mongoose.Types.ObjectId(f.blockedBy));
      });
      console.log(
        "blocked",
        blockedusers,
        "body.loggedInUser",
        body.loggedInUser
      );
      let pipeline = [
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [Number(body.lng), Number(body.lat)]
            },
            distanceField: "coordinates",
            distanceField: "distance",
            spherical: true,
            maxDistance: 20
          }
        },
        {
          $match: { user: { $nin: blockedusers }, isDraft: false }
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user"
          }
        },
        {
          $unwind: "$user"
        },

        {
          $lookup: {
            from: "followers",
            localField: "user._id",
            foreignField: "user",
            as: "followers"
          }
        },
        {
          $match: {
            "user.accountType": "public"
          }
        }
      ];

      //managing private user accounts posts not visible to user
      if (body.loggedInUser) {
        pipeline = [
          {
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [Number(body.lng), Number(body.lat)]
              },
              distanceField: "coordinates",
              distanceField: "distance",
              spherical: true,
              maxDistance: 20
            }
          },
          {
            $match: {
              user: { $nin: blockedusers },
              isDraft: false
            }
          },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "user"
            }
          },
          {
            $unwind: "$user"
          },
          {
            $lookup: {
              from: "followers",
              localField: "user._id",
              foreignField: "user",
              as: "followers"
            }
          },
          {
            $match: {
              $or: [
                { "user.accountType": "public" },
                { "followers.follower": body.loggedInUser }
              ]
            }
          },
          {
            $project: {
              categories: 1,
              tags: 1,
              title: 1,
              cover: 1,
              "user._id": 1,
              "user.username": 1,
              "user.realname": 1,
              "user.profilepic": 1
            }
          }
        ];
      }
      //it works
      if (body.category) {
        body.category.forEach((category, i) => {
          body.category[i] = mongoose.Types.ObjectId(category);
        });
        pipeline.push({ $match: { categories: { $in: body.category } } });
      }
      //it works
      if (body.query) {
        let query1 = new RegExp(body.query, "i");
        console.log("query", query1);
        pipeline.push({
          $match: {
            $or: [
              { title: { $regex: query1, '$options': 'i' } },
              { "user.realname": { $regex: query1, '$options': 'i' } }
            ]
          }
        });
      }
      let subPipeline = [
        {
          $lookup: {
            from: "likeposts",
            localField: "_id",
            foreignField: "post",
            as: "likes"
          }
        },
        {
          $project: {
            categories: 1,
            tags: 1,
            title: 1,
            cover: 1,
            "user._id": 1,
            "user.username": 1,
            "user.realname": 1,
            "user.profilepic": 1,
            like: { $size: "$likes" },
            liked: {
              $filter: {
                input: "$likes",
                as: "isLiked",
                cond: {
                  $eq: [body.loggedInUser, "$$isLiked.user"]
                }
              }
            }
          }
        },
        {
          $project: {
            categories: 1,
            tags: 1,
            title: 1,
            cover: 1,
            like: 1,
            "user._id": 1,
            "user.username": 1,
            "user.realname": 1,
            "user.profilepic": 1,
            isLiked: { $size: "$liked" }
          }
        }
      ];
      pipeline = pipeline.concat(subPipeline);
      const pipeline1 = pipeline.concat([
        { $skip: skip },
        { $limit: constant.PERPAGE },
        { $sort: { _id: -1 } }
      ]);
      const pipeline2 = pipeline.concat([
        {
          $group: {
            _id: null,
            count: { $sum: 1 }
          }
        }
      ]);
      // console.log("pipeline", JSON.stringify(pipeline, null, 2));
      let totalposts = await postModel.aggregate(pipeline2);
      console.log("totalposts", totalposts);
      totalposts = totalposts.length > 0 ? totalposts[0].count : 0;

      postModel.aggregate(pipeline1).then(posts => {
        resolve({
          posts,
          totalpages: Math.ceil(totalposts / constant.PERPAGE),
          postCount: totalposts
        });
      });
    });
  }
  getPostsBrowsing(body) {
    return new Promise(async (resolve, reject) => {
      let skip = 0;
      body.loggedInUser =
        body.loggedInUser != ""
          ? mongoose.Types.ObjectId(body.loggedInUser)
          : null;
      if (Number(body.skip)) skip = Number(body.skip);
      let blockedusers = [];
      // if( body.loggedInUser){
      //    blockedusers = [body.loggedInUser]
      // }
      let blockeduserss = await blockUserModel.find({
        $or: [{ blocked: body.loggedInUser }, { blockedBy: body.loggedInUser }]
      });
      blockeduserss.forEach(f => {
        blockedusers.push(mongoose.Types.ObjectId(f.blocked));
        blockedusers.push(mongoose.Types.ObjectId(f.blockedBy));
      });
      let pipeline = [
        {
          $match: {
            user: { $nin: blockedusers },
            isDraft: false
          }
        },          //  uncomment this
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user"
          }
        },
        {
          $unwind: "$user"
        },
        {
          $lookup: {
            from: "followers",
            localField: "user._id",
            foreignField: "user",
            as: "followers"
          }
        },
        {
          $match: {
            "user.accountType": "public"
          }
        }
      ];
      //managing private user accounts posts not visible to user
      if (body.loggedInUser) {
        pipeline = [
          {
            $match: {
              user: { $nin: blockedusers },
              isDraft: false
            }
          },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "user"
            }
          },
          {
            $unwind: "$user"
          },
          {
            $lookup: {
              from: "followers",
              localField: "user._id",
              foreignField: "user",
              as: "followers"
            }
          },
          {
            $match: {
              $or: [
                { "user.accountType": "public" },
                { "followers.follower": body.loggedInUser }
              ]
            }
          },
          {
            $project: {
              categories: 1,
              tags: 1,
              title: 1,
              cover: 1,
              "user._id": 1,
              "user.username": 1,
              "user.realname": 1,
              "user.profilepic": 1
            }
          }
        ];
      }
      //it works
      if (body.category) {
        body.category.forEach((category, i) => {
          body.category[i] = mongoose.Types.ObjectId(category);
        });
        pipeline.push({ $match: { categories: { $in: body.category } } });
      }
      //it works
      if (body.query) {
        let query1 = new RegExp(body.query, "i");
        console.log("query", query1);
        pipeline.push({
          $match: {
            $or: [
              { title: { $regex: query1, '$options': 'i' } },
              { "user.realname": { $regex: query1, '$options': 'i' } }
            ]
          }
        });
      }
      let subPipeline = [
        {
          $lookup: {
            from: "likeposts",
            localField: "_id",
            foreignField: "post",
            as: "likes"
          }
        },
        {
          $project: {
            categories: 1,
            tags: 1,
            title: 1,
            cover: 1,
            "user._id": 1,
            "user.username": 1,
            "user.realname": 1,
            "user.profilepic": 1,
            like: { $size: "$likes" },
            liked: {
              $filter: {
                input: "$likes",
                as: "isLiked",
                cond: {
                  $eq: [body.loggedInUser, "$$isLiked.user"]
                }
              }
            }
          }
        },
        {
          $project: {
            categories: 1,
            tags: 1,
            title: 1,
            cover: 1,
            like: 1,
            "user._id": 1,
            "user.username": 1,
            "user.realname": 1,
            "user.profilepic": 1,
            isLiked: { $size: "$liked" }
          }
        }
      ];
      pipeline = pipeline.concat(subPipeline);
      const pipeline1 = pipeline.concat([
        { $skip: skip },
        { $limit: constant.PERPAGE },
        { $sort: { _id: -1 } }
      ]);

      const pipeline2 = pipeline.concat([
        {
          $group: {
            _id: null,
            count: { $sum: 1 }
          },
        },

      ]);
      // console.log("pipeline1", JSON.stringify(pipeline1, null, 2));
      let totalposts = await postModel.aggregate(pipeline2);
      console.log("totalposts", totalposts);
      totalposts = totalposts.length > 0 ? totalposts[0].count : 0;
      postModel.aggregate(pipeline1).then(posts => {
        resolve({
          posts,
          totalpages: Math.ceil(totalposts / constant.PERPAGE),
          postCount: totalposts
        });
      });
    });
  }
  likePost(body) {
    return new Promise((resolve, reject) => {
      if (!body.post || !body.user) {
        reject(constant.INVALIDPARAMS);
      } else {
        let query = { post: body.post, user: body.user };
        postLike.findOne(query).then(
          result => {


            if (result) {
              //remove document
              postLike.deleteOne(query).then(async () => {
                let totallikes = await postLike.countDocuments({
                  post: body.post
                });
                resolve({ isliked: 0, totallikes });
              });
            } else {
              postLike.create(query).then(
                async result => {
                  let totallikes = await postLike.countDocuments({
                    post: body.post
                  });

                  postModel.findOne({ _id: body.post }).populate('user').then(user => {
                    let lang = ''
                    if (user.user.lang == 'en')
                      lang = 'en'
                    else
                      lang = 'ch'
                    if (body.user != user.user._id)
                      notif.sendUserNotification(user.user.deviceid, user.user._id, null, null, 1, body.name, user._id, null, lang)
                  })
                  resolve({ isliked: 1, totallikes });
                },
                err => reject(err)
              );
            }
          },
          err => { }
        );
      }
    });
  }
  commentPost(body) {
    return new Promise((resolve, reject) => {
      postComment
        .create({
          post: body.post,
          user: body.user,
          text: body.text,
          createdAt: moment().valueOf()
        })
        .then(
          async result => {
            postModel.findOne({ _id: body.post }).populate('user').then(user => {
              let lang = ''
              if (user.user.lang == 'en')
                lang = 'en'
              else
                lang = 'ch'
              if (body.user != user.user._id)
                notif.sendUserNotification(user.user.deviceid, user.user._id, null, null, 2, body.name, user._id, null, lang)
            })
            await this.addToActivityLog({ action: constant.ACTIVITYCOMMENT + `<a routerlink='${constant.ACTIVITYURL + body.post}' > post </a>`, user: body.user })
            result.user = await userModel.findById(body.user);
            resolve(result);
          },
          err => reject(err)
        );
    });
  }
  likeComment(body) {
    return new Promise((resolve, reject) => {
      let query = { comment: body.comment, user: body.user, post: body.post };
      likeComment.findOne(query).then(
        result => {
          if (result) {
            //remove document
            likeComment.deleteOne(query).then(async () => {
              let totallikes = await likeComment.countDocuments({
                comment: body.comment
              });
              resolve({ isliked: 0, totallikes });
            });
          } else {
            likeComment.create(query).then(
              async result => {
                let totallikes = await likeComment.countDocuments({
                  comment: body.comment
                });
                postComment.findOne({ _id: body.comment }).populate('user').then(comment => {
                  let lang = ''
                  if (comment.user.lang == 'en')
                    lang = 'en'
                  else
                    lang = 'ch'
                  if (body.user != comment.user._id)
                    notif.sendUserNotification(comment.user.deviceid, comment.user._id, null, null, 4, body.name, body.post, null, lang)

                })
                resolve({ isliked: 1, totallikes });
              },
              err => reject(err)
            );
          }
        },
        err => { }
      );
    });
  }

  replyComment(body) {
    return new Promise((resolve, reject) => {
      replyComment
        .create({
          comment: body.comment,
          user: body.user,
          text: body.text,
          createdAt: moment().valueOf()
        })
        .then(
          async result => {
            postModel.findOne({ _id: body.post }).populate('user').then(user => {

              let lang = ''
              if (user.user.lang == 'en')
                lang = 'en'
              else
                lang = 'ch'
              if (body.user != user.user._id)
                notif.sendUserNotification(user.user.deviceid, user.user._id, null, null, 2, body.name, user._id, null, lang)

              replyComment.findOne({ comment: body.comment }).populate('user').then(async reply => {
                let commentperson = await postComment.findOne({ _id: body.comment }).populate('user')
                let lang2 = ''
                if (commentperson.user.lang == 'en')
                  lang2 = 'en'
                else
                  lang2 = 'ch'

                if (body.user != commentperson.user._id)
                  notif.sendUserNotification(commentperson.user.deviceid, commentperson.user._id, null, null, 3, body.name, body.post, null, lang2)
              })

            })
            result.user = await userModel.findById(body.user);
            resolve(result);
          },
          err => reject(err)
        );
    });
  }

  likeReply(body) {
    return new Promise((resolve, reject) => {
      let query = { reply: body.reply, user: body.user, post: body.post };
      likeReply.findOne(query).then(
        result => {
          if (result) {
            likeReply.deleteOne(query).then(async () => {
              let totallikes = await likeReply.countDocuments({
                reply: body.reply
              });
              resolve({ isliked: 0, totallikes });
            });
          } else {
            likeReply.create(query).then(
              async result => {
                let totallikes = await likeReply.countDocuments({
                  reply: body.reply

                });

                replyComment.findOne({ _id: body.reply }).populate('user').then(reply => {
                  let lang = ''
                  if (reply.user.lang == 'en')
                    lang = 'en'
                  else
                    lang = 'ch'
                  if (body.user != reply.user._id)
                    notif.sendUserNotification(reply.user.deviceid, reply.user._id, null, null, 5, body.name, body.post, null, lang)

                })
                resolve({ isliked: 1, totallikes });
              },
              err => reject(err)
            );
          }
        },
        err => {
          reject(err);
        }
      );
    });
  }
  addPostToFavourite(body) {
    return new Promise((resolve, reject) => {
      let query = { post: body.post, user: body.user };
      postfavouriteModel.findOne(query).then(
        async result => {
          let favouriteCount = await postfavouriteModel.countDocuments({
            post: body.post
          });
          if (result) {
            //remove document
            postfavouriteModel.deleteOne(query).then(() => {
              resolve({
                isFavourite: 0,
                favouriteCount: Number(favouriteCount) - 1
              });
            });
          } else {
            postfavouriteModel.create(query).then(
              result => {
                resolve({
                  isFavourite: 1,
                  favouriteCount: Number(favouriteCount) + 1
                });
              },
              err => reject(err)
            );
          }
        },
        err => {
          reject(err);
        }
      );
    });
  }
  getFavouritePosts(userid) {
    return new Promise(async (resolve, reject) => {
      let results = await postfavouriteModel.find({ user: userid }).populate([
        {
          path: "post",
          model: "post",
          populate: [{ path: "categories" }, { path: "isLiked" }, { path: "like" }, { path: "user", model: "user", select: "-password" },]
          // populate: { path: "categories" },
          // populate: { path: "user", model: "user", select: "-password" },
          // // populate: { path: "like" },
          // populate: { path: "isLiked" },

        }
      ]);
      let posts = [];
      results.forEach(result => {
        posts.push(result.post);
      });
      resolve(posts);
    });
  }
  changepassword(body) {
    return new Promise(async (resolve, reject) => {
      let user = await userModel.findById(body.userid);
      if (user) {
        if (user.password == body.oldpassword) {
          userModel.findByIdAndUpdate(body.userid, { password: body });
        }
      }
      reject("User not found");
    });
  }
  getPostDescription(file) {
    return fs.readFileSync(`./server/uploads/posts/description/${file}.txt`);
  }
  getLikedPosts(body) {
    return new Promise(async (resolve, reject) => {
      let skip = 0;
      if (Number(body.skip)) skip = body.skip;
      let results = await postLike
        .find({ user: body.user })
        .skip(skip)
        .populate({
          path: "post",
          model: "post",
          populate: { path: "like user" }
        });
      let posts = [];
      results.forEach(result => {
        posts.push(result.post);
      });
      return resolve(posts);
    });
  }
  //report apis
  reportPost(body) {
    return new Promise((resolve, reject) => {
      let reportPost1 = new reportPost({
        title: body.title,
        post: body.post,
        user: body.user
      });
      reportPost1.save((err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }
  reportComment(body) {
    return new Promise((resolve, reject) => {
      let reportComment1 = new reportComment({
        title: body.title,
        comment: body.comment,
        user: body.user
      });
      reportComment1.save((err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }
  reportCommentReply(body) {
    return new Promise((resolve, reject) => {
      let reportCommentReply1 = new reportCommentReply({
        title: body.title,
        reply: body.reply,
        user: body.user
      });
      reportCommentReply1.save((err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }
  //end of report apis

  //search user profiles
  search(body) {
    return new Promise(async (resolve, reject) => {

      let blockedusers = [];
      let blockeduserss = await blockUserModel.find({
        $or: [
          { blocked: body.loggedinuser },
          { blockedBy: body.loggedinuser }
        ]
      });

      blockeduserss.forEach(f => {
        blockedusers.push(mongoose.Types.ObjectId(f.blocked));
        blockedusers.push(mongoose.Types.ObjectId(f.blockedBy));
      });

      let query = body.query;
      let skip = 0;
      if (Number(body.skip)) skip = body.skip;
      let name = new RegExp(query, "i");


      let queryd = {
        $or: [{ username: name }, { realname: name }, { title: name }],
        _id: { $nin: blockedusers },

      };
      console.log(body, body.query);

      userModel
        .find(queryd, "profilepic  accountType realname username title experience")
        .skip(skip)
        .limit(constant.PERPAGE)
        .populate({
          path: "followed",
          model: "follower",
          match: { follower: body.loggedinuser ? body.loggedinuser : null }
        })
        // .populate({ path: "posts", model: "post", select: "cover", match: { isDraft: false } })
        .populate({
          path: "posts", model: "post", select: " cover ", match: { isDraft: false },
          populate: { path: "user", select: "_id", match: { "accountType": "public" } }
        })

        .populate({ path: "postscount", model: "post", match: { isDraft: false } })
        .sort("-date")
        .then(
          async results => {
            let total = await userModel.countDocuments(queryd);
            resolve({
              results,
              totalpages: Math.ceil(total / constant.PERPAGE)
            });
          },
          err => {
            reject(err);
          }
        );
    });
  }
  // end of search user profiles
  // privacy apis
  followRequestUser(body) {
    return new Promise((resolve, reject) => {
      let query = { user: body.user, follower: body.follower };
      followRequestModel.findOne(query).then(
        result => {
          if (result) {
            followRequestModel.deleteOne(query).then(res => {
              resolve({
                requested: 0,
                message: "user follow request cancled "
              });
            });
          } else {
            let follower = new followRequestModel(query);
            follower.save(err => {
              if (err) return reject(err);
              resolve({ requested: 1, message: "user follow request sent" });
            });
          }
        },
        err => {
          reject(err);
        }
      );
    });
  }
  getfollowRequest(body) {
    return new Promise(async (resolve, reject) => {
      resolve(
        await followRequestModel
          .find({ user: body.user })
          .populate({ path: "isFollowedByMe", model: "follower" })
          .populate({
            path: "follower",
            model: "user",
            select: "profilepic accountType realname title username"
          })
      );
    });
  }
  //end of privay apis
  //blocked user apis
  blockUser(body) {
    return new Promise((resolve, reject) => {
      //if already blocked delete document else add
      let query = { blocked: body.blocked, blockedBy: body.blockedBy };
      blockUserModel.findOne(query).then(
        result => {
          if (result) {
            blockUserModel.deleteOne(query).then(res => {
              resolve({ isBlocked: 0, message: "user is unblocked" });
            });
          } else {
            let follower = new blockUserModel(query);
            follower.save(err => {
              if (err) return reject(err);
              resolve({ isBlocked: 1, message: "user is blocked" });
            });
          }
        },
        err => {
          reject(err);
        }
      );
    });
  }
  getBlockedUserList(body) {
    return new Promise(async (resolve, reject) => {
      resolve(
        await blockUserModel.find({ blockedBy: body.blockedBy }).populate({
          path: "blocked",
          model: "user",
          select: "profilepic accountType realname title username"
        })
      );
    });
  }
  //end of blocked user apis
  tagPostSearchUser(body) {
    return new Promise(async (resolve, reject) => {
      if (!(mongoose.Types.ObjectId.isValid(body.user))) return reject("path user is invalid")
      body.query = body.query ? body.query : ""
      userModel.aggregate([
        {
          $match: {
            $or: [
              { realname: { $regex: body.query, '$options': 'i' } },
              { username: { $regex: body.query, '$options': 'i' } }
            ]
          }
        },

        {
          "$lookup": {
            "from": "blockusers",
            "localField": '_id',
            "foreignField": 'blockedBy',
            "as": 'blockedBy'
          }
        },


        {
          "$lookup": {
            "from": "blockusers",
            "localField": '_id',
            "foreignField": 'blocked',
            "as": 'blocked'
          }
        },

        {
          "$lookup": {
            "from": "followers",
            "localField": '_id',
            "foreignField": 'user',
            "as": 'folowers'
          }
        },
        {
          $project: {

            "profilepic": 1,
            "realname": 1,
            "title": 1,
            "tagPrivacy": 1,
            "username": 1,
            "folowers": 1,
            blocked: { $arrayElemAt: ["$blocked", 0] },
            blockedBy: { $arrayElemAt: ["$blockedBy", 0] }
          }
        },
        {
          $match: {
            blocked: null, blockedBy: null
          }
        }
        ,
        {
          $match: {

            $or: [{ "tagPrivacy": false },
            { "folowers.follower": mongoose.Types.ObjectId(body.user) }]
          }
        },
        {
          $project: {

            "profilepic": 1,
            "realname": 1,
            "title": 1,
            "tagPrivacy": 1,
            "username": 1,
          }
        }]).then((result) => {
          resolve(result)
        })
    });
  }

  async addToActivityLog(data) {
    let activity = new userActivityLogModel({
      user: data.user,
      action: data.action,
      createdAt: moment().valueOf()
    })

    await activity.save(() => {
      return
    })
  }

  applyBrandAuth(body, files) {
    console.log("files", files);
    let documents = []

    if (files.file) {
      files.file.forEach((file) => {
        documents.push({
          path: "/static/branddoc/" + file.filename,
          ext: path.extname(file.filename)
        })
      })
    }
    return new Promise(async (resolve, reject) => {
      //  let brandPreCheck = await brandAuthModel.findOne({user:body.user})
      //  if(brandPreCheck && brandPreCheck.status=="")
      let brandRequest = new brandAuthModel({
        user: body.user,
        name: body.name,
        address: body.address,
        contact: body.contact,
        emailOrPhone: body.emailOrPhone,
        documents,
        createdAt: moment().valueOf()
      })
      brandRequest.save((err, result) => {
        if (err) { return reject(err) }
        resolve(result)
      })
    })
  }
  aaaBrandAchievements(body, files) {
    let achievements = []
    if (files) {
      files.file.forEach((file) => {
        achievements.push({
          path: "/static/branddoc/" + file.filename,
          ext: path.extname(file.filename)
        })
      })
    }
    return new Promise((resolve, reject) => {
      let brandAchievement = new brandAchievementsModel({
        user: body.user,
        realname: body.realname,
        achievements,
        trophies: body.trophies,
        idType: body.idType,
        idNumber: body.idNumber,
        createdAt: moment().valueOf()
      })
      brandAchievement.save((err, result) => {
        if (err) { return reject(err) }
        resolve(result)
      })
    })
  }

  updatePost(body, files) {
    return new Promise((resolve, reject) => {
      // let cover = ""
      console.log("in updatePost ");
      if (body.categories)
        body.categories = JSON.parse(body.categories)
      if (files.cover) {
        body.cover = `/static/posts/cover-${files.cover[0].originalname}`
      }
      if (body.tags) {
        body.tags = JSON.parse(body.tags)
      }
      if (files.file) {
        console.log(files.file);

        body.file = `/static/posts/cover-${files.file[0].originalname}`
      }

      console.log("body", body);

      postModel.findByIdAndUpdate(body.id, body, { new: true }).then((result) => {
        resolve(result)
      })
    })
  }
  deletePost(id) {
    return new Promise(async (resolve, reject) => {
      if (!id) { return reject("path `id` is required") }
      await reportPost.deleteMany({ post: id })
      await postfavouriteModel.deleteMany({ post: id })
      await postLike.deleteMany({ post: id })
      resolve(await postModel.findByIdAndDelete(id))
    })
  }

  getDraftPosts(body) {
    return new Promise((resolve, reject) => {
      let skip = 0;
      if (Number(body.skip)) skip = body.skip;
      let qry = { user: body.userid, isDraft: true };
      let sort = { _id: -1 };
      postModel
        .find(qry)
        .sort("-_id")
        .populate({ path: "categories", model: "categories" })
        .populate({ path: "user", select: "realname profilepic username" })
        .skip(skip)
        .limit(constant.PERPAGE)
        .sort(sort)
        .then(async posts => {
          let totalposts = await postModel.countDocuments(qry);
          console.log("totalpostsv", totalposts);
          resolve({
            posts,
            totalpages: Math.ceil(totalposts / constant.PERPAGE)
          });
        });
    });
  }

  getFollower(body) {
    return new Promise((resolve, reject) => {
      let { loggedInUser, sort, search, type } = body
      if (!body.loggedInUser) { return reject("path `loggedInUser` is required") }
      if (type == undefined) { return reject("please provide type 1 for followers and 0 for following ") }
      let query = {};
      let listType = {}
      let lookup = {}
      let sorting
      if (type == 1) {        //followers
        listType = { user: mongoose.Types.ObjectId(loggedInUser) }
        lookup = {
          from: "users",
          localField: "follower",
          foreignField: "_id",
          as: "user"

        }
      }
      else {                  // following

        listType = { follower: mongoose.Types.ObjectId(loggedInUser) }
        lookup = {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user"

        }

      }
      let skip = 0;
      if (Number(body.skip)) skip = body.skip;
      if (search) {
        query = { "user.realname": { $regex: search, $options: 'i' } }
      }


      if (sort)
        sorting = sort
      else sorting = 1
      followModel
        .aggregate(
          [
            { $match: listType },
            {
              $lookup: lookup
            },
            {
              $lookup: {
                from: "followers",
                localField: "follower",
                foreignField: "user",
                as: "followed"
              }
            },
            { $unwind: "$user" },
            { $match: query },
            {
              $project: {
                "user._id": 1, "user.realname": 1, "user.profilepic": 1, "user.title": 1,
                followed:

                  { $cond: { if: { $gte: [{ $size: "$followed" }, 1] }, then: 1, else: 0 } }

              }
            },
            { $sort: { "_id": sorting } }

          ]
        )


        .skip(skip)
        .limit(constant.PERPAGE)
        .then(async result => {

          let totalposts = await followModel.countDocuments(listType);
          let followers = await followModel.countDocuments({ user: loggedInUser });
          let following = await followModel.countDocuments({ follower: loggedInUser });
          resolve({
            result, status: 1, count: totalposts, followers: followers, following: following,
            totalpages: Math.ceil(totalposts / constant.PERPAGE)
          });
        });
    });
  }

  getChatlist(id) {
    return new Promise((resolve, reject) => {
      console.log(id);
      var IDs = [];
      groupModel.find({ members: id }).then(groupMembers => {
        groupMembers.map(value => {

          IDs.push(mongoose.Types.ObjectId(value._id))
        })
        messageModel.aggregate([
          {
            $match: {
              $or: [
                { to: mongoose.Types.ObjectId(id) },
                {
                  from: mongoose.Types.ObjectId(id)
                },
                {

                  groupId: { $in: IDs }

                }
              ],
              is_deleted: false,
              'deleteConverstation': { '$nin': [mongoose.Types.ObjectId(id)] }

            }
          },
          {
            $lookup:
            {
              from: "users",
              localField: "to",
              foreignField: "_id",
              as: "to"
            }
          },

          {
            $lookup:
            {
              from: "users",
              localField: "from",
              foreignField: "_id",
              as: "from"
            }
          },
          {
            $lookup:
            {
              from: "groups",
              localField: "groupId",
              foreignField: "_id",
              as: "group"
            }
          },
          {
            $group: {
              "_id": "$conversationId",
              "messageId": { $last: "$_id" },
              "type": { $first: "$type" },
              "message": { $last: "$message" },
              "group": { $last: { $arrayElemAt: ["$group", 0] } },
              "to": { $last: { $arrayElemAt: ["$to", 0] } },
              "from": { $last: { $arrayElemAt: ["$from", 0] } },
              "conversationId": { $first: "$conversationId" },
              "messageType": { $last: "$messageType" },
              "date": { $last: "$date" },
              unreadCount: { $sum: { $cond: { if: { $in: [mongoose.Types.ObjectId(id), "$readBy"] }, then: 0, else: 1 } } } //{ $cond: { if: "$readBy", then: "$to", else: {} } },


            }
          },


          {
            $project: {


              "_id": 0,
              "messageId": 1,
              "messageType": 1,
              "message": 1,
              "group": {
                $cond: { if: "$group", then: "$group", else: {} }
              },
              date: 1,
              "unread": "$readBy",
              "sender": 1,
              "to": { $cond: { if: "$to", then: "$to", else: {} } },
              "from": 1,
              unreadCount: 1,
              conversationId: 1,
              chatName: { $cond: { if: "$group", then: "$group", else: { $cond: { if: { $eq: ["$from._id", mongoose.Types.ObjectId(id)] }, then: "$to", else: "$from" } } } }
              // { $cond: { if: { $gt: [{ $size: "$Chatname" }, 0] }, then: 1, else: 0 } }, else: "NA" } }
            }

          },

          { $sort: { "date": -1 } }
        ]).then(result => {
          let sum = 0
          result.map(v => {
            sum = sum + v.unreadCount
          })
          result.push({ total: sum })


          resolve({ result, sum })

        }).catch(err => {
          console.log(err.errors);

          if (err.errors)
            return reject(helper.handleValidation(err))
          return reject(Constant.FALSEMSG)
        })
      })




    })
  }

  reportUser(body) {
    return new Promise((resolve, reject) => {
      let { userId, opponentId, conversationId } = body
      if (!userId || !opponentId || !conversationId) {
        reject("Either userId or conversationId or opponentId is missing")
      }
      else {


        blockUserModel.findOneAndUpdate({ blocked: opponentId, blockedBy: userId },
          { $set: { blocked: opponentId, blockedBy: userId } },
          { upsert: true, returnNewDocument: true })
          .then(blocked => {
            console.log(blocked);

            messageModel.updateMany({ conversationId: conversationId, from: userId },
              {
                $set: { "is_deleted": true }
              }).then(update => {

                resolve("Reported Succefully")
              })
              .catch(err => {
                console.log("update", err);

              })

          }).catch(err => {
            console.log("block", err);
          })
      }
    })
  }

  searchUserChatList(id, query) {
    return new Promise((resolve, reject) => {
      console.log(query);
      var IDs = [];
      groupModel.find({ members: id }).then(groupMembers => {
        groupMembers.map(value => {

          IDs.push(mongoose.Types.ObjectId(value._id))
        })
        messageModel.aggregate([
          {
            $match: {
              $or: [
                { to: mongoose.Types.ObjectId(id) },
                {
                  from: mongoose.Types.ObjectId(id)
                },
                {

                  groupId: { $in: IDs }

                }
              ],
              'deleteConverstation': { '$nin': [mongoose.Types.ObjectId(id)] }

            }
          },
          {
            $lookup:
            {
              from: "users",
              localField: "to",
              foreignField: "_id",
              as: "to"
            }
          },

          {
            $lookup:
            {
              from: "users",
              localField: "from",
              foreignField: "_id",
              as: "from"
            }
          },
          {
            $lookup:
            {
              from: "groups",
              localField: "groupId",
              foreignField: "_id",
              as: "group"
            }
          },
          {
            $group: {
              "_id": "$conversationId",
              "messageId": { $last: "$_id" },
              "type": { $first: "$type" },
              "message": { $last: "$message" },
              "group": { $last: { $arrayElemAt: ["$group", 0] } },
              "to": { $last: { $arrayElemAt: ["$to", 0] } },
              "from": { $last: { $arrayElemAt: ["$from", 0] } },
              "conversationId": { $first: "$conversationId" },
              "messageType": { $last: "$messageType" },
              "date": { $last: "$date" },
              unreadCount: { $sum: { $cond: { if: { $in: [mongoose.Types.ObjectId(id), "$readBy"] }, then: 0, else: 1 } } } //{ $cond: { if: "$readBy", then: "$to", else: {} } },


            }
          }, {
            $project: {
              "messageId": "$messageId",
              "messageType": "$messageType",
              "message": "$message",
              "type": "$type",
              chatName: { $cond: { if: "$group", then: "$group", else: { $cond: { if: { $eq: ["$from._id", mongoose.Types.ObjectId(id)] }, then: "$to", else: "$from" } } } }
            }
          },
          {
            $match: {
              $or: [{
                "chatName.realname": { $regex: query.name, $options: 'i' }
              },
              {
                "chatName.groupName": { $regex: query.name, $options: 'i' }
              }]

            }
          },
          { $project: { _id: 0, "chatName._id": 1, type: 1, "chatName.image": 1, "chatName.realname": 1, "chatName.groupName": 1, "chatName.profilepic": 1, messageType: 1, message: 1, messageId: 1 } },
          { $sort: { "date": -1 } }
        ]).then(result => {
          resolve(result)
        }).catch(err => {
          console.log(err);

          if (err.errors)
            return reject(helper.handleValidation(err))
          return reject(0)
        })
      })




    })
  }
  getMutual(id, search) {
    return new Promise((resolve, reject) => {
      let query = {}
      if (search) {
        query.$or = [{ "user.realname": { $regex: search, '$options': 'i' } }, {
          "user.title": { $regex: search, '$options': 'i' }
        }]
      }
      followModel.aggregate([
        { $match: { user: mongoose.Types.ObjectId(id) } },
        {
          "$lookup": {
            "from": "followers",
            "let": {
              "currUser": "$user",
              "currFollower": "$follower"
            },
            "pipeline": [
              {
                "$match": {
                  "$expr": {
                    "$and": [
                      {
                        "$eq": [
                          "$user",
                          "$$currFollower"
                        ]
                      },
                      {
                        "$eq": [
                          "$follower",
                          "$$currUser"
                        ]
                      }
                    ]
                  }
                }
              }
            ],
            "as": "matched"
          }
        },
        {
          "$match": {
            "matched.0": {
              "$exists": true
            }
          }
        },
        {
          "$group": {
            "_id": null,
            "usersThatFollowEachOther": { "$addToSet": "$follower" }
          }
        }, {
          $lookup: {
            from: "users",
            localField: "usersThatFollowEachOther",
            foreignField: "_id",
            as: "user"
          }
        },
        { $unwind: "$user" },
        { $match: query },
        { $project: { _id: 0, "user.title": 1, "user.profilepic": 1, "user._id": 1, "user.realname": 1 } }
      ]
      ).then(result => {
        resolve(result)
      })
    })
  }

  uploadMedia(file) {
    return new Promise((resolve, reject) => {
      if (!file)
        reject(Constant.FILEMISSING)
      else
        resolve('/static/users/' + file.filename)

    })
  }

  uploadVideo(file) {
    return new Promise((resolve, reject) => {
      let thumb = 'thumbnail' + Date.now() + '.png'

      var proc = new ffmpeg(path.join(process.cwd() + "/server/uploads/users/" + file.filename))
        .takeScreenshots({
          count: 1,
          timemarks: ['1'], // number of seconds
          filename: thumb,
          size: '160x120'
        }, process.cwd() + "/server/uploads/thumbnails/", function (err, data) {


          console.log('screenshots were saved')
        });
      console.log(thumb);

      resolve({ original: '/static/users/' + file.filename, thumbnail: '/static/thumbnails/' + thumb })
    }).catch(err => {
      throw err
    })

  }







  createGroup(data, files) {
    return new Promise((resolve, reject) => {
      if (data.groupName && data.userArray && data.createdBy) {
        let file = ''
        if (files)
          file = "/static/users/" + files.filename
        console.log(file);

        const groupSchema = new groupModel({
          members: JSON.parse(data.userArray),
          groupName: data.groupName,
          admin: data.createdBy,
          createdBy: data.createdBy,
          image: file,
          date: moment().valueOf()
        })
        groupSchema.save().then(group => {

          const message = new messageModel({
            message: '',
            from: group.createdBy,
            messageType: 'group',
            type: 'text',
            groupId: group._id,
            conversationId: group._id
          })
          message.save().then(save => {

          })

          groupModel.findOneAndUpdate({ _id: group._id }, { $addToSet: { members: data.createdBy } }, { new: true }).then(result => {
            ;
            resolve(result)
          }).catch(err => {
            if (err.errors)
              return reject(helper.handleValidation(err))
            return reject(Constant.FALSEMSG)
          })

        })


          .catch((error) => {

            if ((error.name == 'ValidationError'))
              reject(Constant.OBJECTIDERROR)

            reject(Constant.OBJECTIDERROR)
          })
      }
      else {
        reject(Constant.PARAMSMISSING)
      }

    })

  }


  getGroupInfo(id) {
    return new Promise(async (resolve, reject) => {
      if (!id)
        reject("Please Provide groupId")
      else {
        groupModel.findOne({ _id: id }).populate('members', 'profilepic title realname').then(info => {
          resolve(info)
        }).catch(err => {
          console.log(err);

        })
      }
    })
  }

  updateGroup(body, files) {
    return new Promise(async (resolve, reject) => {
      let { groupId, type, groupName, userArray, admin } = body
      if (!groupId || !type)
        reject("Either groupId or type is missing")
      else {
        let query = {}
        if (type == 1) {
          if (groupName) { query.groupName = groupName }
          if (files) { query.image = "/static/users/" + files.filename }
        }
        else {
          query = { $addToSet: { members: { $each: JSON.parse(userArray) } } }
        }
        groupModel.findOneAndUpdate({ _id: groupId },
          query, { new: true }
        ).then(result => {
          resolve(result)
        }).catch(err => {
          console.log(err);

        })
      }



    })
  }
  leaveGroup(data) {
    return new Promise(async (resolve, reject) => {
      let { groupId, userId } = data
      if (!data.groupId || !data.userId) { reject(Constant.GROUPUSERMISSING) }
      else {
        let data = await groupModel.findOne({ _id: groupId })
        let userTobeadmin = data.members[0]
        console.log("hreeee", data);
        if (data.admin == userId) {
          groupModel.findOneAndUpdate({ _id: groupId },
            { $pull: { members: userId } }, { new: true }
          ).then(data => {
            groupModel.findOneAndUpdate({ _id: groupId }, { $set: { admin: userTobeadmin } }, { new: true })
              .then(update => {
                resolve(update)

              })
          }).catch(err => {
            console.log(err);

          })
        }
        else {
          groupModel.findOneAndUpdate({ _id: groupId },
            { $pull: { members: userId } }, { new: true }
          ).then(data => {

            resolve(data)
          }).catch(err => {
            console.log(err);

          })
        }


      }
    })
  }

  expelMember(data) {
    return new Promise(async (resolve, reject) => {
      let { groupId, userId, adminId } = data
      if (!data.groupId || !data.userId || !data.adminId) { reject(Constant.GROUPUSERADMINMISSING) }
      else {
        let data = await groupModel.findOne({ _id: groupId })
        console.log(data);

        if (adminId == data.admin) {
          groupModel.findOneAndUpdate({ _id: groupId },
            { $pull: { members: userId } }, { new: true }
          ).then(data => {

            resolve(data)
          }).catch(err => {
            console.log(err);

          })
        }

        else {
          reject("Only admin can remove members")
        }


      }
    })
  }
  deleteGroup(data) {
    return new Promise(async (resolve, reject) => {
      if (body.lang == "en")
        CONSTANT = ENCONSTANT
      else {
        CONSTANT = CHCONSTANT
      }
      let { groupId } = data
      if (!data.groupId) { reject(Constant.PARAMSGROUPMISSING) }
      else {

        groupModel.findOneAndUpdate({ _id: groupId }, { $set: { isActive: false } }).then(
          deleted => {
            resolve(CONSTANT.GROUPDELETESUCCESS)
          }
        ).catch(err => {
          console.log(err);

        })
      }
    })
  }

  getUserNotifications(userId, skip) {
    return new Promise(async (resolve, reject) => {
      console.log(userId);

      if (!userId) { reject(Constant.PARAMSMISSING) }
      else {
        let skipParam = 0;
        if (Number(skip)) skipParam = Number(skip);
        let result = await nofication.find({ receiverId: userId }).sort({ _id: -1 }).skip(skipParam)
        let totalposts = await nofication.countDocuments({ receiverId: userId })
        if (result)
          resolve({
            result, totalpages: Math.ceil(totalposts / constant.PERPAGE),
            postCount: totalposts
          })

      }
    })
  }


}
module.exports = new UserController();
