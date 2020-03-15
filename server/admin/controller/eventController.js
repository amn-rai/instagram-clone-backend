
const constant = require("../../constant");
const moment = require("moment");
const nodeMailer = require("nodemailer");
const sgTransport = require("nodemailer-sendgrid-transport");
const bcrypt = require("../../common/bcryp");
const commonHandler = require("../../common/commonHandler");
const fs = require("fs");
const mongoose = require("mongoose");
// const _ = require("underscore");

// models
const eventModel = require("../../models/eventModel")
const eventfavouriteModel = require("../../models/eventfavouriteModel")
class eventController {

  createEvent(body, file) {
    return new Promise((resolve, reject) => {
      console.log("body", body);
      new eventModel({
        creator: body.creator,
        // organizers: body.organizers,
        title: body.title,
        cover: file ? "/static/events/" + file.filename : "",
        description: body.description,
        coordinates: [body.lng, body.lat], //[lat,lng],
        location: body.location,
        lat: body.lat,
        lng: body.lng,
        city: body.city,
        startdate: body.startdate,
        enddate: body.enddate,
        createdAt: moment().valueOf()
      }).save((err, result) => {
        if (err) return reject(err)
        resolve(result)
      })
    })
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
      let query = {}
      let current = Number(body.current ? body.current : 1);
      let skip = constant.PERPAGE * current - constant.PERPAGE;
      //time vice filter
      if (body.filter && body.filter == 1) {
        if (!(body.startdate && body.enddate)) reject("startdate and enddate  required for filter:1")
        query.$and = [{ startdate: { $gte: body.startdate } }, { enddate: { $lte: body.enddate } }]
      }

      //category vice filter

      if (body.filter && body.filter == 2) {

      }

      //location vice filter

      if (body.filter && body.filter == 3) {
        if (!body.city) return reject("city is required for filter:3")
        query.city = new RegExp(body.city, "i")
        // query.coordinates={
        //   $geoWithin:{
        //       $centerSphere:[[ body.lng,body.lat],20/3963]
        //       }
        //   }

      }
      //price vice filter
      if (body.filter && body.filter == 4) {
        console.log("body.startfee", body.startfee, "body.endfee", body.fee);
        query.$and = [{ fee: { $gte: body.startfee } }, { fee: { $lte: body.endfee } }]
      }
      if (body.query) {
        query.title = new RegExp(body.query, "i")
      }
      console.log("query", query);
      eventModel.find(query).populate({ path: "creator", model: "user", select: "realname" })
        .sort("-_id")
        .skip(skip)
        .limit(constant.PERPAGE)
        .then(async (events) => {

          let totalEvents = await eventModel.countDocuments(query);
          resolve({
            events,
            totalpages: Math.ceil(totalEvents / constant.PERPAGE),
            totalEvents
          });

        })
    }
    )
  }
}
module.exports = new eventController();
