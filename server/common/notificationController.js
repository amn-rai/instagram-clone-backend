var FCM = require('fcm-node');

var server2 = `AAAA_IkB9-I:APA91bGYg-ZawpBO0fUndVNFG376dV94PTcWJa1hRMNUqPZjTRGO25vR4GIoqlnqTG2KoPRWf5LpMG0K_xbmP2tZ4HJ6Hw47XbuBXCyIeO-GwJPZiPi71Kw2JCJB70Rqoj7tAzJkCFoo`
var fcm = new FCM(server2);
const User = require('../models/userModel')
const notification = require('../models/notification')
const ENCONSTANT = require("../lib/language/en");
const CHCONSTANT = require("../lib/language/sp");
let CONSTANT = {};
const moment = require('moment')
class notiController {
    // sendUserNotification(userId, opponentId, type, msg, data) {
    sendUserNotification(IDS, opponentId, msg, data, type, name, typeID, groupName, lang) {
        console.log("LANG", lang);
        User.findById(opponentId).then(async user => {
            let sendType = ''
     // if (user.deviceid) {
            var message = {};
            if (type == 0) {
                sendType = 'to'
                opponentId.map(async value => {
                    let badge = await User.findOneAndUpdate({ _id: value._id }, {
                        $inc: { badge: 1 }
                    }, { new: true })

                    if (badge.lang == "en")
                        CONSTANT = ENCONSTANT
                    else
                        CONSTANT = CHCONSTANT

                    message[sendType] = badge.deviceid
                    message['content_available'] = true,
                        message['notification'] = {
                            title: '可趣',
                            body: `${name}` + `${CONSTANT.CREATEPOST}`,
                            sound: "default",
                            date: moment().valueOf()
                        },
                        message['data'] = {
                            title: `${name}` + `${CONSTANT.CREATEPOST}`,
                            // body: `${name} has created a post`,
                            typeID: typeID,
                            type: type,
                            date: moment().valueOf()

                        }
                    console.log(message);

                    message['notification']['badge'] = badge.badge
                    this.createNotification(message['notification']['body'], value._id, type)
                    this.fcm_func(message)

                })


            }

            if (type == 1) {
                if (lang == "en")
                    CONSTANT = ENCONSTANT
                else {
                    CONSTANT = CHCONSTANT
                }
                sendType = 'to'
                message[sendType] = IDS
                message['notification'] = {
                    title: '可趣',
                    body: `${name} ` + `${CONSTANT.LIKEPOST}`,
                    sound: "default",
                    date: moment().valueOf()
                }
                message['data'] = {
                    title: `${name}` + `${CONSTANT.LIKEPOST}`,
                    type: type,
                    typeID: typeID,
                    date: moment().valueOf()
                }

                this.createNotification(message['notification']['body'], opponentId, type)
                this.getBadge(opponentId).then(value => {
                    message['notification']['badge'] = value
                    this.fcm_func(message)

                })



            }

            if (type == 2) {
                if (lang == "en")
                    CONSTANT = ENCONSTANT
                else {
                    CONSTANT = CHCONSTANT
                }
                sendType = 'to'
                message[sendType] = IDS
                message['notification'] = {

                    title: '可趣',
                    sound: "default",
                    body: `${name} ` + `${CONSTANT.COMMENTPOST}`,
                    date: moment().valueOf()
                }
                message['data'] = {
                    body: `${name} ` + `${CONSTANT.COMMENTPOST}`,
                    type: type,
                    typeID: typeID,
                    date: moment().valueOf()
                }
                this.createNotification(message['notification']['body'], opponentId, type)
                this.getBadge(opponentId).then(value => {
                    message['notification']['badge'] = value
                    this.fcm_func(message)

                })
            }
            if (type == 3) {
                if (lang == "en")
                    CONSTANT = ENCONSTANT
                else {
                    CONSTANT = CHCONSTANT
                }
                sendType = 'to'
                message[sendType] = IDS
                message['notification'] = {
                    title: '可趣',
                    sound: "default",
                    body: `${name}` + `${CONSTANT.REPLYCOMMENT}`,
                    date: moment().valueOf()
                }
                message['data'] = {
                    body: `${name}` + `${CONSTANT.REPLYCOMMENT}`,
                    type: type,
                    typeID: typeID,
                    date: moment().valueOf()
                }
                this.createNotification(message['notification']['body'], opponentId, type)
                this.getBadge(opponentId).then(value => {
                    message['notification']['badge'] = value
                    this.fcm_func(message)

                })
            }

            if (type == 4) {
                if (lang == "en")
                    CONSTANT = ENCONSTANT
                else {
                    CONSTANT = CHCONSTANT
                }
                sendType = 'to'
                message[sendType] = IDS
                message['notification'] = {
                    title: '可趣',
                    sound: "default",
                    body: `${name}` + `${CONSTANT.LIKECOMMENT}`,
                    date: moment().valueOf()
                }
                message['data'] = {
                    body: `${name}` + `${CONSTANT.LIKECOMMENT}`,
                    type: type,
                    typeID: typeID,
                    date: moment().valueOf()
                }
                this.createNotification(message['notification']['body'], opponentId, type)
                this.getBadge(opponentId).then(value => {
                    message['notification']['badge'] = value
                    this.fcm_func(message)

                })
            }

            if (type == 5) {
                if (lang == "en")
                    CONSTANT = ENCONSTANT
                else {
                    CONSTANT = CHCONSTANT
                }
                sendType = 'to'
                message[sendType] = IDS
                message['notification'] = {
                    title: '可趣',
                    sound: "default",
                    body: `${name}` + `${CONSTANT.LIKEREPLY}`,
                    date: moment().valueOf()
                }
                message['data'] = {
                    body: `${name}` + `${CONSTANT.LIKEREPLY}`,
                    type: type,
                    typeID: typeID,
                    date: moment().valueOf()
                }
                this.createNotification(message['notification']['body'], opponentId, type)
                this.getBadge(opponentId).then(value => {
                    message['notification']['badge'] = value
                    this.fcm_func(message)

                })
            }
            if (type == 6) {
                sendType = 'to'



                opponentId.map(async value => {

                    let badge = await User.findOneAndUpdate({ _id: value._id }, {
                        $inc: { badge: 1 }
                    }, { new: true })

                    if (badge.lang == "en")
                        CONSTANT = ENCONSTANT
                    else
                        CONSTANT = CHCONSTANT

                    message[sendType] = badge.deviceid
                    message['notification'] = {
                        title: '可趣',
                        sound: "default",
                        body: `${name}` + `${CONSTANT.CREATEEVENT}`,
                        date: moment().valueOf()
                    },
                        message['data'] = {

                            title: `${name}` + `${CONSTANT.CREATEEVENT}`,
                            // body: `${name} has created a post`,
                            typeID: typeID,
                            type: type,
                            date: moment().valueOf()
                        }
                    message['notification']['badge'] = badge.badge
                    this.createNotification(message['notification']['body'], value._id, type)
                    this.fcm_func(message)



                })
            }
            if (type == 7) {
                if (lang == "en")
                    CONSTANT = ENCONSTANT
                else {
                    CONSTANT = CHCONSTANT
                }
                sendType = 'to'
                message[sendType] = IDS
                message['notification'] = {
                    title: '可趣',
                    sound: "default",
                    body: `${name}` + `${CONSTANT.LIKEEVENT}`,
                    date: moment().valueOf()
                }
                message['data'] = {
                    title: `${name}` + `${CONSTANT.LIKEEVENT}`,
                    type: type,
                    typeID: typeID,
                    date: moment().valueOf()
                }
                this.createNotification(message['notification']['body'], opponentId, type)
                this.getBadge(opponentId).then(value => {
                    message['notification']['badge'] = value
                    this.fcm_func(message)

                })
            }


            if (type == 8) {
                if (lang == "en")
                    CONSTANT = ENCONSTANT
                else {
                    CONSTANT = CHCONSTANT
                }
                sendType = 'to'
                message[sendType] = user.deviceid
                message['notification'] = {
                    title: '可趣',
                    body: name + CONSTANT.SENDMESSAGE,
                    username: name,
                    // body: msg,
                    type: type,
                    sound: "default",
                    date: moment().valueOf()
                }
                message['data'] = {
                    title: '可趣',
                    body: name + name + CONSTANT.SENDMESSAGE,
                    username: name,
                    body: msg,
                    type: type,
                    notiData: data,
                    date: moment().valueOf()
                }
                this.getBadge(opponentId).then(value => {
                    message['notification']['badge'] = value
                    this.fcm_func(message)

                })
            }

            if (type == 9) {

                if (lang == "en")
                    CONSTANT = ENCONSTANT
                else {
                    CONSTANT = CHCONSTANT
                }
                sendType = 'to'
                console.log(IDS, opponentId, msg);
                message[sendType] = IDS
                message['notification'] = {
                    title: '可趣',
                    sound: "default",
                    body: `${name} ${CONSTANT.GROUPSEND} ${groupName}`,
                    date: moment().valueOf()
                }
                message['data'] = {
                    title: `${name} ${CONSTANT.GROUPSEND} ${groupName}`,
                    username: name,
                    body: msg,
                    type: type,
                    notiData: data,
                    date: moment().valueOf()
                }
                this.createNotification(message['notification']['body'], opponentId, type)
                this.getBadge(opponentId).then(value => {
                    message['notification']['badge'] = value
                    this.fcm_func(message)

                })

            }


        }).catch(err => console.log('queryerror', err))
    }

    clearBadgeArray(IDS, message) {
        IDS.map(async value => {
            let badge = await User.findOneAndUpdate({ _id: value }, {
                $inc: { badge: 1 }
            }, { new: true })

            message['data']['badge'] = badge.badge


        })


    }
    async clearSingleBadge(id, message) {
        console.log(id);

        let badge = await User.findOneAndUpdate({ _id: id }, {
            $inc: { badge: 1 }
        }, { new: true })

        Object.defineProperty(message, 'badge', {
            value: badge.badge,
            writable: false
        });



    }


    fcm_func(message) {
        fcm.send(message, function (err, response) {
            if (err) {
                console.log("Something has gone wrong!" + err);
            } else {
                console.log("Successfully sent with response: ", response);
            }
        });
    }

    async getBadge(id) {

        var count = new Promise((resolve, reject) => {
            User.findOneAndUpdate({ _id: id }, {
                $inc: { badge: 1 }
            }, { new: true }).then(badge => {
                resolve(badge.badge)

            })

        })


        return count

    }
    createNotification(msg, _id, type) {
        const notiData = new notification({
            receiverId: _id,
            title: msg,
            notificationType: type,
            time: moment().valueOf()
        })
        notiData.save({})
    }


}

module.exports = notiController