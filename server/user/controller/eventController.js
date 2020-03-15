
const constant = require("../../constant");
const moment = require("moment");
const nodeMailer = require("nodemailer");
const sgTransport = require("nodemailer-sendgrid-transport");
const bcrypt = require("../../common/bcryp");
const commonHandler = require("../../common/commonHandler");
const followModel = require("../../models/followModel");
const fs = require("fs");
const mongoose = require("mongoose");
const noficationController = require("../../common/notificationController")
const notif = new noficationController()
// const _ = require("underscore");
const ObjectId = mongoose.Types.ObjectId

// models
const eventModel = require("../../models/eventModel")
const eventfavouriteModel = require("../../models/eventfavouriteModel")
class eventController {

  createEvent(body, file) {
    return new Promise((resolve, reject) => {
      console.log("fr2:body", body);
      new eventModel({
        creator: body.creator,
        // organizers: body.organizers,
        title: body.title,
        cover: file ? "/static/event/" + file.filename : "",
        description: body.description,
        coordinates: [body.lng, body.lat], //[lat,lng],
        location: body.location,
        lat: body.lat,
        fee: body.fee,
        lng: body.lng,
        city: body.city,
        startdate: body.startdate,
        enddate: body.enddate,
        categories: JSON.parse(body.categories),
        createdAt: moment().valueOf()
      }).save((err, result) => {


        if (err) return reject(err)
        console.log("fr1: saved result ", result);
        followModel.find({ user: body.creator }).populate('follower').then(user => {
          let followers_device_IDS = []
          let followers_user_IDS = []
          user.map(follower => {

            followers_device_IDS.push(follower.follower.deviceid);
            followers_user_IDS.push(follower.follower._id);

          })



          notif.sendUserNotification(followers_device_IDS, followers_user_IDS, null, null, 6, body.name, result.id, null, body.lang)
        })



        resolve(result)
      })
    })
  }

  addeventToFavourite(body) {
    return new Promise((resolve, reject) => {
      let query = { event: body.event, user: body.user };
      eventfavouriteModel.findOne(query).then(
        async result => {
          let favouriteCount = await eventfavouriteModel.countDocuments({
            event: body.event
          });
          if (result) {
            //remove document
            eventfavouriteModel.deleteOne(query).then(() => {
              resolve({
                isFavourite: 0,
                favouriteCount: Number(favouriteCount) - 1
              });
            });
          } else {
            eventfavouriteModel.create(query).then(
              result => {
                eventModel.findOne({ _id: body.event }).populate('creator').then(eventCreator => {
                  let lang = ''
                  if (eventCreator.creator.lang == 'en')
                    lang = 'en'
                  else
                    lang = 'ch'
                  if (body.user != eventCreator.creator._id)
                    notif.sendUserNotification(eventCreator.creator.deviceid, eventCreator.creator._id, null, null, 7, body.name, body.event, null, lang)
                })
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

  getFavouriteEvents(body) {
    return new Promise(async (resolve, reject) => {


      let results = await eventfavouriteModel.find({ user: body.user }).populate([
        {
          path: "event",
          model: "event",
          // select: "-lat -lng -organizers -coordinates -creator fee"
          // populate: { path: "creator", model: "user", select: "realname profilepic" }
        },

      ])
      let events = [];
      results.forEach(result => {
        result.event.isFavourite = 1
        events.push(result.event);
      });
      resolve(events);
    });
  }
  getEvent(body) {
    return new Promise(async (resolve, reject) => {

      resolve(await eventModel.findById(body.event)
        .populate([{
          path: "creator", model: "user", select: "realname profilepic",
          populate: { path: "followed", model: "follower", match: { follower: body.user ? body.user : null } }
        }, { path: "isFavourite", match: { user: body.user ? body.user : null } }]))
    }
    )
  }
  getEvents(body) {
    return new Promise(async (resolve, reject) => {

      // JSON.parse(body)
      let query = {}
      var IDS = []
      let skip = body.skip ? body.skip : 0



      //time vice filter
      if (body.startdate && body.enddate && body.startfee && body.endfee) {
        if (body.startdate == 0 && body.enddate == 0) {

          query.$and = [
            { fee: { $gte: body.startfee, $lte: body.endfee } }, { startdate: { $gte: new Date() } }
          ]
        }
        else {

          query.$and = [{ startdate: { $gte: body.startdate } },

          { enddate: { $lte: body.enddate } },
          { fee: { $gte: body.startfee, $lte: body.endfee } },
          ]

        }

      }
      //category vice filter

      if (body.categories) {
        body.categories.map(value => {

          IDS.push(ObjectId(value))
        })
        query.categories = { $in: IDS }


      }

      //location vice filter
      if (body.city) {
        query.city = new RegExp(body.city, "i")
      }
      //price vice filter
      // if (body.startfee || body.startfee == 0 && body.endfee || body.endfee == 0) {
      //   console.log("body.startfee", body.startfee, "body.endfee", body.endfee);
      //   query.$and.push({ fee: { $gte: body.startfee } }, { fee: { $lte: body.endfee } })
      // }
      // if (body.startfee || body.startfee == 0 && body.endfee || body.endfee == 0) {
      //   console.log("body.startfee", body.startfee, "body.endfee", body.fee);
      //   query.$and = [{ fee: { $gte: body.startfee } }, { fee: { $lte: body.endfee } }]
      // }
      if (body.query) {
        query.title = new RegExp(body.query, "i")
      }
      if (body.loggedInUser) {
        query.creator = body.loggedInUser
      }
      console.log("query111", JSON.stringify(query));
      eventModel.find(query).populate({ path: "isFavourite", match: { user: body.user ? body.user : null } }).then(async (results) => {
        let totalEvents = await eventModel.countDocuments(query)
        resolve({
          results, totalpages: Math.ceil(totalEvents / constant.PERPAGE)
        })
      })
    }
    )
  }

  updateEvent(body, file) {
    return new Promise(async (resolve, reject) => {
      let { eventId, location, lat, fee, enddate, categories, startdate, city, title, lng, description, coordinates } = body
      if (!eventId) { reject("please provide eventId ") }
      else {
        var query = {}
        if (title)
          query.title = title
        if (description)
          query.description = description
        if (lat && lng)
          query.coordinates = [lng, lat]
        if (location)
          query.location = location
        if (lat)
          query.lat = lat
        if (fee)
          query.fee = fee
        if (lng)
          query.lng = lng
        if (city)
          query.city = city
        if (startdate)
          query.startdate = startdate
        if (enddate)
          query.enddate = enddate
        if (categories)
          query.categories = JSON.parse(body.categories)

      }
      if (file) {
        query.cover = "/static/event/" + file.filename
      }
      eventModel.findByIdAndUpdate({ _id: eventId }, { $set: query }, { new: true }).then(update => {
        resolve(update)
      }).catch(err => {
        console.log(err);

      })
    })

  }

  deleteEvent(query) {
    return new Promise(async (resolve, reject) => {
      console.log(query.eventId);

      let eventId = query.eventId
      if (!eventId) { reject("please provide eventId ") }
      else {
        eventModel.findOneAndDelete({ _id: eventId }).then(deleted => {
          console.log(deleted);

          if (deleted)
            resolve("event deleted successfully")

        }).catch(err => {
          console.log(err);

        })
      }
    })
  }
}
module.exports = new eventController();
