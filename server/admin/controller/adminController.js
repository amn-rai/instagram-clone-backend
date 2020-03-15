const userModel = require("../../models/userModel");
const adminModel = require("../../models/adminModel");
const categoryModel = require("../../models/categoryModel");
const commentPostModel = require("../../models/commentPostModel");
const reportCommentModel = require("../../models/reportComment");
const likepostModel = require("../../models/likepostModel");
const reportPost = require("../../models/reportPost");
const reportComment = require("../../models/reportComment");
const postModel = require("../../models/postModel");
const eventModel = require("../../models/eventModel");
const userActivityLog = require("../../models/userActivityLog");
const brandAuthModel = require("../../models/brandAuthModel");
const brandArchiements = require("../../models/brandArchiements");
const constant = require("../../constant");
const moment = require("moment");
const nodeMailer = require("nodemailer");
const sgTransport = require("nodemailer-sendgrid-transport");
const bcrypt = require("../../common/bcryp");
const commonHandler = require("../../common/commonHandler");
const fs = require("fs");
const _ = require("underscore");
class adminController {
  register(body, file) {
    return new Promise((resolve, reject) => {
      console.log("body".body);

      let admin = new adminModel({
        name: body.name,
        password: bcrypt.hashPassword(body.password),
        admin: body.admin,
        email: body.email
      });
      if (file) {
        admin.profilepic = "/static/admin/" + file.filename;
      }

      if (body.admin) {
        admin.permitions = body.permitions;
      }
      admin.save(err => {
        if (err) return reject(commonHandler.mongoErrorHandler(err));
        resolve();
      });
    });
  }

  async generateUsername(realname) {
    console.log("realnamerealnamerealname", realname);
    realname = realname ? realname : "user";
    let username = `${realname.replace(/ /g, "").toLowerCase()}${Math.ceil(
      Math.random() * 1000000
    )}`;
    console.log(`username ${username}`);
    let valid;
    try {
      valid = await userModel.findOne({ username: username });
    } catch (err) {
      console.log("catch err", err);
    }
    console.log("valid", valid);

    if (valid) this.generateUsername(realname);
    else return username;
  }

  login(body) {
    return new Promise((resolve, reject) => {
      adminModel.findOne({ email: body.email }).then(
        result => {
          if (result && bcrypt.compareHash(body.password, result.password)) {
            resolve(result);
          } else {
            reject("Email or Password is incorrect.");
          }
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
          res => {
            resolve(res);
          },
          err => {
            reject(commonHandler.mongoErrorHandler(err));
          }
        );
    });
  }
  getUser(body) {
    return new Promise((resolve, reject) => {
      //.populate('favouriteStores')
      userModel
        .findById(body.profileuser)
        .sort("-_id")
        .populate({
          path: "followed",
          modelName: "follower",
          match: { follower: body.loggedinuser ? body.loggedinuser : null }
        })
        // .populate({
        //   path: "followed",
        //   modelName: "follower",
        // })
        .then(
          result => {
            if (!result) reject("user not found");
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

  search(q) {
    return new Promise((resolve, reject) => {
      let query = q.q;
      if (query.charAt(0) === '"' && query.charAt(query.length - 1) === '"') {
        query = query.substr(1, query.length - 2);
      }
      let name = new RegExp(query, "i");
      let queryd = { $or: [{ username: name }, { realname: name }] };
      userModel
        .find(queryd)
        .sort("-date")
        .then(
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
      userModel
        .findOneAndUpdate(
          { phone: body.phone },
          { password: bcrypt.hashPassword(body.password) }
        )
        .then(
          user => {
            resolve("Password is changed succesfully.");
          },
          err => {
            reject(err);
          }
        );
    });
  }
  getCategories() {
    return new Promise((resolve, reject) => {
      categoryModel
        .find({ deleted: false })
        .populate("postsCount")
        .sort({ date: -1 })
        .then(
          result => {
            if (!result) reject("Please add some categories to watch here.");
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

  checkPhone(phone) {
    return new Promise((resolve, reject) => {
      userModel.findOne({ phone }).then(
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
      var regex = new RegExp("^" + body.title + "$", "ig");

      categoryModel.findOne({ title: regex, deleted: false }).then(
        result => {
          if (result) {
            return reject("Category allready exist !");
          }
          let category = new categoryModel({
            title: body.title,
            date: moment().valueOf()
          });
          category.save((err, result) => {
            if (err) {
              return reject(err);
            }
            resolve(result);
          });
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
  createPost(body, file) {
    return new Promise((resolve, reject) => {
      console.log("body", body);

      let post = new postModel({
        title: body.title,
        categories: JSON.parse(body.categories),
        tags: JSON.parse(body.tags),
        user: body.user,
        coordinates: [Number(body.lng), Number(body.lat)], // for geofencing queries
        lat: body.lat,
        lng: body.lng,
        // isDraft: body.isDraft,
        cover: file ? `/static/posts/${file.filename}` : ""
      });
      post.save((err, result) => {
        if (err) return reject(err);
        fs.appendFile(
          `./server/uploads/posts/description/${result._id}.txt`,
          body.description,
          res => {
            resolve(result);
          }
        );
      });
    });
  }
  getSinglePost(id) {
    return new Promise(async (resolve, reject) => {
      postModel
        .findOne({ _id: id, isDraft: false })
        .populate({ path: "categories", select: "-deleted" })
        .populate({ path: "like" })
        .populate({ path: "user", select: "realname profilepic username" })
        .populate({
          path: "comment",
          populate: [
            { path: "commentLike", modelName: "commentLike" },
            { path: "user", select: "realname profilepic username" },
            {
              path: "commentReply",
              modelName: "commentReply",
              populate: [
                { path: "user", select: "realname profilepic username" }
              ]
            }
          ]
        })
        .then(
          result => {
            resolve(result);
          },
          err => {
            reject(err);
          }
        );
    });
  }
  getPosts(body) {
    return new Promise((resolve, reject) => {
      let skip = 0;
      if (Number(body.skip)) skip = body.skip;
      let qry = { user: body.userid };
      if (body.category) {
        qry.categories = { $in: [body.category] };
      }
      if (body.query) {
        qry.title = new RegExp(body.query, "i");
      }
      let sort = { _id: -1 };
      if (Number(body.date)) sort = { _id: 1 };
      qry.isDraft = false;
      console.log("query", qry);
      postModel
        .find(qry)
        .sort("-_id")
        .populate({ path: "like" })
        .populate({ path: "categories", model: "categories" })
        .populate({ path: "isLiked", match: { user: body.user } })
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

  changePassword(id, body, hash) {
    return new Promise((resolve, reject) => {
      userModel.findById(id).then(
        result => {
          if (bcrypt.compareHash(body.oldPassword, result.password)) {
            userModel
              .findByIdAndUpdate(result._id, { password: hash.password })
              .then(
                res => {
                  resolve("Password updated successfully.");
                },
                err => {
                  reject(err);
                }
              );
          } else {
            reject("Current password is incorrect.");
          }
        },
        err => {
          reject(err);
        }
      );
    });
  }

  getDashboard() {
    return new Promise(async (resolve, reject) => {
      let totalPosts = await postModel.countDocuments();
      let totalUsers = await userModel.countDocuments();
      let totalComments = await commentPostModel.countDocuments();
      let totalEvents = await eventModel.countDocuments();
      let totalLikes = await likepostModel.countDocuments();
      let popularCategories = await categoryModel.find({ deleted: false }).populate("postsCount");

      let popularPosts = await postModel.aggregate([
        {
          $lookup: {
            from: "likeposts",
            localField: "_id",
            foreignField: "post",
            as: "likes"
          }
        },
        {
          $addFields: {
            like: { $size: "$likes" }
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
          $sort: {
            like: -1
          }
        },
        {
          $limit: 5
        },
        {
          $project: {
            "user.realname": 1,
            title: 1,
            like: 1,
            cover: 1
          }
        }
      ]);
      popularCategories = popularCategories
        .sort((a, b) => {
          return a.postsCount - b.postsCount;
        })
        .reverse();
      let recentPosts = await postModel
        .find()
        .sort("-_id")
        .limit(5)
        .populate({ path: "user", model: "user" });
      let recentComments = await commentPostModel
        .find()
        .sort("-_id")
        .limit(5)
        .populate({ path: "user", model: "user" })
        .populate({ path: "post", model: "post" });
      resolve({
        totalPosts,
        totalUsers,
        totalComments,
        totalLikes,
        totalEvents,
        recentPosts,
        recentComments,
        popularCategories,
        popularPosts
      });
    });
  }
  getUsers(body) {
    return new Promise((resolve, reject) => {
      let query = { deleted: false };
      let current = Number(body.current ? body.current : 1);
      let skip = constant.PERPAGE * current - constant.PERPAGE;
      userModel
        .find(query)
        .sort("-_id")
        .skip(skip)
        .limit(10)
        .then(async users => {
          let totalusers = await userModel.countDocuments(query);

          resolve({ users, totalusers });
        });
    });
  }
  getDashboardChartData() {
    return new Promise(async (resolve, reject) => {
      let startOfWeek = moment()
        .startOf("week")
        .add(1, "day")
        .startOf("day")
        .valueOf();
      let endOfWeek = moment()
        .endOf("week")
        .add(1, "day")
        .startOf("day")
        .valueOf();
      console.log("startofweek", startOfWeek);
      console.log("endofweek", endOfWeek);
      let startOfMonth = moment()
        .startOf("month")
        .startOf("day")
        .valueOf();
      let endOfMonth = moment()
        .endOf("month")
        .startOf("day")
        .valueOf();
      console.log("startOfMonth", startOfMonth, "endOfMonth", endOfMonth);

      let weeklyUser = await userModel.find(
        {
          $and: [
            { createdAt: { $gte: startOfWeek } },
            { createdAt: { $lte: endOfWeek } }
          ]
        },
        "createdAt"
      );
      let monthlyUser = await userModel.find(
        {
          $and: [
            { createdAt: { $gte: startOfMonth } },
            { createdAt: { $lte: endOfMonth } }]
        },
        "createdAt"
      );

      console.log("weeklyUser", weeklyUser, "monthlyUser", monthlyUser);

      let temp = [0, 0, 0, 0, 0, 0, 0]; // ["Monday", "Tuesday", "Wednesday","Thursday", "Friday", "Saturday", "Sunday"]
      for (let i = 0; i < 7; i++) {
        weeklyUser.forEach(user => {
          if (
            user.createdAt > moment(startOfWeek).add(i, "day") &&
            user.createdAt < moment(startOfWeek).add(i + 1, "day")
          ) {
            temp[i] = temp[i] + 1;
          }
        });
      }

      // for(let i=1;i<=moment(endOfMonth).date();i++){
      //   monthlyUser.forEach((user) => {
      //     // console.log("moment(user.createdAt).date()",moment(user.createdAt).date());
      //     // if (moment(user.createdAt).date() == i ) {
      //        console.log("i", temp1[moment(user.createdAt).date()] );
      //        if(moment(user.createdAt).date())
      //       temp1[]  = temp1[moment(user.createdAt).date()] + 1;
      //     // }
      //   });
      // }

      //  let startOfMonth = moment()
      //         .startOf("month")
      //         .startOf("day")
      //         .valueOf();
      //       let endOfMonth = moment(1577166071000)
      //         .endOf("month")
      //         .startOf("day")
      //         .valueOf();
      //         console.log("startofweek",startOfMonth);

      //       console.log("endofweek",moment(endOfMonth).date());
      //  let date = []
      //  console.log(moment().endOf("month").date())
      //  for(let i=0;i<moment().endOf("month").date();i++){
      //  date[i] =0
      //  }
      //  console.log(date)
      //  let users  = [ {
      //      createdAt: 1574414899450,
      //      id: '5dd7aa33b46784337c86fd9a' },
      //    {
      //      createdAt: 1574055671000,
      //      id: '5dd7aa73b46784337c86fd9b' },
      //    {
      //      createdAt: 1574414979151,
      //      id: '5dd7aa83b46784337c86fd9c' },
      //    {
      //      createdAt: 1574487671000,
      //      id: '5dd7aa92b46784337c86fd9d' },
      //    {
      //      createdAt: 1574574071000,
      //      id: '5dd7820facb10b1ad6470efc' } ]
      //  let temp =  _.groupBy(users,(user)=>{
      //      return moment(user.createdAt).date()
      //    })
      //    // console.log(temp)
      //   let temp1 = _.mapObject(temp, function(val, key) {
      //    return val.length;
      //  })

      //  console.log( temp1)
      //  Object.keys(temp1).forEach((key)=>{
      //    date[key] = temp1[key]
      //  })
      //  let startOfMonth = moment()
      //         .startOf("month")
      //         .startOf("day")
      //         .valueOf();
      //       let endOfMonth = moment(1577166071000)
      //         .endOf("month")
      //         .startOf("day")
      //         .valueOf();
      //         console.log("startofweek",startOfMonth);

      //       console.log("endofweek",moment(endOfMonth).date());
      console.log("monthlyUser", monthlyUser);

      let date = []
      for (let i = 0; i < moment().endOf("month").date(); i++) {
        date[i] = 0
      }
      let groupBy = _.groupBy(monthlyUser, (user) => {
        return moment(user.createdAt).date()
      })
      console.log("groupby", groupBy);

      let temp1 = _.mapObject(groupBy, function (val, key) {
        return val.length;
      })
      console.log("temp1", temp1);

      Object.keys(temp1).forEach((key) => {
        date[key - 1] = temp1[key]
      })

      console.log("date", date);

      resolve({ weeklyUsers: temp, monthlyUsers: date });
    });
  }
  getComments(body) {
    return new Promise(async (resolve, reject) => {
      let query = {};
      let current = Number(body.current ? body.current : 1);

      console.log("body d", body);

      let skip = constant.PERPAGE * current - constant.PERPAGE;
      if (body.type == 1) {   //recent comments
        console.log("type", 1);

        commentPostModel
          .find(query)
          .sort("-_id")
          .skip(skip)
          .limit(constant.PERPAGE)
          .populate({ path: "user", model: "user", select: "realname" })
          .then(async comments => {
            let totalcomments = await commentPostModel.countDocuments();
            resolve({ comments, totalcomments });
          });
      }
      else if (body.type == 2) {   //popular comments
        console.log("type", 2);

        let pipeline = [
          {
            $lookup: {
              from: "likecomments",
              localField: "_id",
              foreignField: "comment",
              as: "likes"
            }
          },
          {
            $addFields: {
              like: { $size: "$likes" }
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
            $sort: {
              like: -1
            }
          }
        ]

        let pipelineForTotalCount = pipeline.concat([
          {
            $group: {
              _id: null,
              count: { $sum: 1 }
            }
          }
        ])

        let totalComments = await commentPostModel.aggregate(pipelineForTotalCount)
        totalComments = totalComments.length > 0 ? totalComments[0].count : 0;

        pipeline = pipeline.concat([{
          $skip: skip
        },
        {
          $limit: constant.PERPAGE
        },
        {
          $project: {
            "user.realname": 1,
            text: 1,
            post: 1,
            createdAt: 1,
            like: 1,
            cover: 1
          }
        }])
        commentPostModel.aggregate(pipeline).then(comments => {
          resolve({
            comments,
            totalpages: Math.ceil(totalComments / constant.PERPAGE),
            totalcomments: totalComments
          });
        });


      }  //end of else if

      else {  //reported comments

        reportCommentModel
          .find(query)
          .sort("-_id")
          .skip(skip)
          .limit(constant.PERPAGE)
          .populate({ path: "user", model: "user", select: "realname" })
          .populate({ path: "comment", model: "postcomment", select: "text createdAt post" })
          .then(async comments => {
            let totalcomments = await reportCommentModel.countDocuments();
            resolve({ comments, totalpages: Math.ceil(totalcomments / constant.PERPAGE), totalcomments });
          });

      }
    });
  }

  //update user

  updateComment(id, body) {
    return new Promise((resolve, reject) => {
      commentPostModel
        .findByIdAndUpdate(id, body, { new: true })
        .then(
          res => {
            resolve(res);
          },
          err => {
            reject(err);
          }
        );
    });
  }
  //delete user
  deleteComment(id, query) {
    return new Promise(async (resolve, reject) => {
      console.log("id", id);

      if (query.reportedComment == 1) {
        console.log("query.reportedComment", true);
        reportCommentModel.findByIdAndDelete(id).then(result => {
          console.log("deleteStaus", result);
          if (result) resolve();
          reject(constant.FALSEMSG)
        });
      }
      else {
        console.log("query.reportedComment", false);
        commentPostModel.findByIdAndDelete(id).then(result => {
          console.log("result", result);

          reportCommentModel.deleteMany({ comment: id }).then(result => {
            console.log("deleteStaus", result);
            if (result) resolve();
            reject(constant.FALSEMSG)
          });
        });
      }
    });
  }
  //delete user
  // deleteReportedComment(body) {
  //   // {	"comment":"","reportedComment":""}
  //        resolve()
  //        )
  // }

  registerWithPhone(body, file) {
    return new Promise(async (resolve, reject) => {
      console.log(body, "multipart");
      let user = new userModel({
        realname: body.realname,
        // email: Body.email,
        title: body.title,
        gender: body.gender,
        user: body.username,
        phone: body.phone,
        username: body.username,
        createdAt: moment().valueOf(),
        password: bcrypt.hashPassword(body.password),
        birthday: body.birthday,
        profilepic: file ? "/static/users/" + file.filename : "",
        deviceid: body.deviceid
      });
      if (!body.username) {
        body.username = await this.generateUsername(body.realname);
      }
      user.save((err, result) => {
        if (err) return reject(commonHandler.mongoErrorHandler(err));
        resolve(result);
      });
    });
  }

  //update user

  updateUser(id, body, file) {
    return new Promise((resolve, reject) => {
      if (file) {
        body.profilepic = "/static/users/" + file.filename;
      }
      // body.birthday = moment(body.birthday, "DD-MM-YYYY").format("x")
      userModel
        .findByIdAndUpdate(id, body, { new: true, runValidators: true })
        .then(
          res => {
            resolve(res);
          },
          err => {
            reject(commonHandler.mongoErrorHandler(err));
          }
        );
    });
  }
  //delete user
  deleteUser(id) {
    return new Promise((resolve, reject) => {
      postModel.deleteMany({ user: id }).then(async result => {
        resolve(await userModel.findByIdAndDelete(id));
      });
    });
  }

  //delete category
  deleteCategory(id) {
    return new Promise(async (resolve, reject) => {

      resolve(await categoryModel.findByIdAndUpdate(id, { deleted: true }));
    });
  }
  getUser(id) {
    return new Promise(async (resolve, reject) => {
      resolve(await userModel.findById(id));
    });
  }

  //delete post
  deletePost(id) {
    return new Promise(async (resolve, reject) => {
      resolve(await postModel.findOneAndDelete(id));
    });
  }

  //subadmin apis

  getSubadmins(body) {
    return new Promise((resolve, reject) => {
      let skip = 0;
      if (Number(body.skip)) skip = body.skip;
      let qry = { _id: { $ne: body.adminId } };
      if (body.query) {
        qry.name = new RegExp(body.query, "i");
      }
      console.log("query", qry);
      adminModel
        .find(qry)
        .sort("-_id")
        .skip(skip)
        .limit(constant.PERPAGE)
        .then(async users => {
          let totalUsers = await adminModel.countDocuments(qry);
          resolve({
            users,
            totalpages: Math.ceil(totalUsers / constant.PERPAGE),
            totalUsers
          });
        });
    });
  }

  registerAdmin(body) {
    return new Promise((resolve, reject) => {
      console.log("body", body);
      let subAdmin = new adminModel({
        email: body.email,
        name: body.password,
        password: bcrypt.hashPassword(body.password),
        user_read: body.user_read,
        user_write: body.user_write,
        user_delete: body.user_delete,
        comment_read: body.comment_read,
        comment_write: body.comment_write,
        comment_delete: body.comment_delete,
        notification_read: body.notification_read,
        notification_write: body.notification_write,
        analytics_read: body.analytics_read,
        reports_read: body.reports_read
      });
      subAdmin.save((err, result) => {
        if (err) return reject(commonHandler.mongoErrorHandler(err));
        resolve(result);
      });
    });
  }

  getSingleSubadmin(id) {
    return new Promise((resolve, reject) => {
      adminModel.findById(id).then(result => {
        resolve(result);
      });
    });
  }

  updateSubadmin(id, body) {
    return new Promise((resolve, reject) => {
      // if (file) {
      //   body.profilepic = "/static/users/" + file.filename;
      // }
      // body.birthday = moment(body.birthday, "DD-MM-YYYY").format("x")
      adminModel
        .findByIdAndUpdate(id, body, { new: true, runValidators: true })
        .then(
          res => {
            resolve(res);
          },
          err => {
            reject(commonHandler.mongoErrorHandler(err));
          }
        );
    });
  }
  // deleteSubadmin
  deleteSubadmin(id) {
    return new Promise((resolve, reject) => {
      adminModel.findByIdAndDelete(id).then(async result => {
        resolve();
      });
    });
  }

  getreportedPosts(body) {
    return new Promise(async (resolve, reject) => {
      resolve(await this.paginationFun(body, reportPost));
    });
  }
  getreportedComments(body) {
    return new Promise(async (resolve, reject) => {
      resolve(await this.paginationFun(body, reportComment));
    });
  }
  async paginationFun(body, modelnameZ) {
    let query = {};
    let data = {};
    if (body.query) {
      query = body.query;
    }
    let current = Number(body.current ? body.current : 1);
    let skip = constant.PERPAGE * current - constant.PERPAGE;
    console.log("query", query);

    await modelnameZ
      .find(query)
      .sort("-_id")
      .populate({
        path: "post",
        model: "post",
        populate: { path: "user", model: "user", select: "realname" }
      })
      .populate({ path: "user", model: "user", select: "realname" })
      .populate({
        path: "comment",
        model: "postcomment",
        populate: { path: "user", model: "user", select: "realname" }
      })
      .skip(skip)
      .limit(10)
      .then(async results => {
        let total = await modelnameZ.countDocuments(query);
        data = { results, total };
      });
    return data;
  }

  //delete user
  deleteEvent(id) {
    return new Promise((resolve, reject) => {
      eventModel.findByIdAndDelete(id).then(result => {
        resolve();
      }, (err) => {
        reject(err)
      });
    });
  }
  getUserActivities(body) {
    return new Promise(async (resolve, reject) => {
      resolve(await userActivityLog.find({ user: body.user }));
    });
  }
  getBrandAuthRequests(body) {
    return new Promise(async (resolve, reject) => {
      resolve(await this.paginationFun(body, brandAuthModel));
    });
  }
  getBrandAuthRequest(id) {
    return new Promise(async (resolve, reject) => {
      let brand = await brandAuthModel.findById(id)
      resolve({ brand, brandArchiements: await brandArchiements.find({ user: brand.user }) });
    });
  }
  getBrandAchievements(body) {
    return new Promise(async (resolve, reject) => {
      body.query = { user: body.user }
      resolve(await this.paginationFun(body, brandArchiements));
    });
  }

  deleteBrandRequest(id) {
    return new Promise((resolve, ) => {
      brandAuthModel.findByIdAndDelete(id).then(result => {
        resolve();
      }, (err) => {
        reject(err)
      });
    });
  }
  deleteAchievement(id) {
    return new Promise((resolve, reject) => {
      brandArchiements.findByIdAndDelete(id).then(result => {
        resolve();
      }, (err) => {
        reject(err)
      });
    });
  }

  updateBrandAuth(body) {
    return new Promise(async (resolve, reject) => {
      resolve(await brandAuthModel.findByIdAndUpdate(body.id, { status: body.status }))
    })
  }
}
module.exports = new adminController();
