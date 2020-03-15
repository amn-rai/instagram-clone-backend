// import { log } from "util";
const messageModel = require("../models/message")
const conversationModel = require("../models/conversation")
const Constant = require('../constants/constant')
const groupModel = require('../models/group')
const mongoose = require("mongoose");
const userModel = require('../models/userModel')
const moment = require('moment')
const followingModel = require('../models/followModel')
const blockModel = require("../models/blockUserModel");
const noficationController = require("../common/notificationController")

const notif = new noficationController()

class socketController {

    // Send Message to a group or particular user
    sendMessage(socket, io, socketInfo, room_members) {
        socket.on('sendMessage', async (data) => {

            console.log("SENDMESSAGE");

            blockModel.findOne({ blockedBy: data.to, blocked: data.from }).then(block => {

                socket.username = data.username

                if (block)
                    data.isBlocked = true
                else
                    data.isBlocked = false

                const messageSchema = this.createMessageSchema(data, data.conversationId)

                messageSchema.save().then((result) => {
                    if (block) {
                        io.to(socket.id).emit('sendMessage', { success: Constant.TRUE, result: result, message: Constant.BLOCKMESSAGE })
                    }
                    else {
                        messageModel.populate(messageSchema, { path: "to from" }, async function (err, populatedData) {

                            if (data.messageType == 'single') {
                                let privacy = await userModel.findOne({ _id: data.to })
                                if (!privacy.messagePrivacy) {

                                    populatedData.set('chatName', populatedData.from, { strict: false })

                                    io.to(socketInfo[data.to]).emit('listenMessage', { success: Constant.TRUE, result: populatedData })
                                    let lang = ''
                                    let msg = populatedData.message
                                    if (populatedData.to.lang == 'en')
                                        lang = 'en'
                                    else
                                        lang = 'ch'
                                    console.log(populatedData.to);

                                    notif.sendUserNotification(data.from, data.to, msg, populatedData, 8, populatedData.from.realname, null, null, lang)
                                }
                                else {

                                    followingModel.findOne({ user: data.from, follower: data.to })
                                        .then(isfollowing => {
                                            if (isfollowing) {
                                                populatedData.set('chatName', populatedData.from, { strict: false })

                                                io.to(socketInfo[data.to]).emit('listenMessage', { success: Constant.TRUE, result: populatedData })
                                                let lang = ''
                                                if (populatedData.to.lang == 'en')
                                                    lang = 'en'
                                                else
                                                    lang = 'ch'
                                                let msg = populatedData.message
                                                notif.sendUserNotification(data.from, data.to, msg, populatedData, 8, populatedData.from.realname, null, null, lang)
                                            }
                                            else
                                                io.to(socket.id).emit('sendMessage', { success: Constant.FALSE, message: Constant.NOTFOLLOWING })

                                        })
                                }
                            }
                            else {
                                var IDS = []
                                var userIDS = []

                                groupModel.findOne({ _id: data.groupId }).then(result => {

                                    result.members.map(async value => {
                                        console.log("GROUPNAME", data.groupName);

                                        if (String(value) != String(populatedData.from._id)) {

                                            let user = await userModel.findOne({ _id: value })
                                            populatedData.set('chatName', result, { strict: false })
                                            let obj = {}
                                            obj.from = populatedData.from
                                            obj.message = populatedData.message
                                            obj.messageType = populatedData.messageType
                                            obj.conversationId = populatedData.conversationId
                                            obj.type = populatedData.type
                                            obj.chatName = result
                                            obj.unreadCount = 0
                                            let lang = ''
                                            if (user.lang == 'en')
                                                lang = 'en'
                                            else
                                                lang = 'ch'
                                            notif.sendUserNotification(user.deviceid, user._id, obj.message, populatedData, 9, populatedData.from.realname, null, data.groupName, lang)
                                            io.to(socketInfo[value]).emit('listenMessage', { success: Constant.TRUE, result: obj })
                                            // IDS.push(user.deviceid)
                                            // userIDS.push(user._id)

                                        }
                                    })

                                })

                            }
                            io.in(data.conversationId).emit('sendMessage', { success: Constant.TRUE, result: populatedData }); //emit to all in room including sender
                        })
                    }
                }).catch(error => {

                    if ((error.name == 'ValidationError'))
                        io.to(socketInfo[data.from]).emit('sendMessage', { error: Constant.OBJECTIDERROR, success: Constant.FALSE })
                    else
                        io.to(socketInfo[data.from]).emit('sendMessage', error)
                })
            })
        })
    }
    // Message Schema

    createMessageSchema(data, conversation_id) {
        if (data.messageType == 'group')
            var conversation_id = data.groupId
        let message = new messageModel({
            message: data.message,
            to: data.to,
            from: data.from,
            type: data.type,
            messageType: data.messageType,
            groupId: data.groupId,
            conversationId: conversation_id,
            date: moment().valueOf(),
            readBy: data.from,
            isBlocked: data.isBlocked,
            media: data.media,
            mediaThumb: data.mediaThumb,
            duration: data.duration,
            location: data.location,
            lat: data.lat,
            long: data.long
        })
        return message;
    }

    // Add a username to connected socket for Single chat

    addUsername(socket, io, socketInfo) {
        socket.on('add', (user) => {
            console.log('add');
            socket.username = user.userId
            socketInfo[user.userId] = socket.id;
            io.emit(`${socket.username}_status`, { status: true, onlineTime: moment().valueOf() });
            io.emit('userOnline', { userId: socket.username, isOnline: Constant.TRUE, onlineTime: moment().valueOf() })

        })
    }


    userList(socket, io) {
        socket.on('userList', (user) => {
            userModel.find({}).then(result => {
                io.to(socket.id).emit('userList', { users: result })
            })

        })
    }
    //Get Chat History for one to one chat

    chatHistory(socket, io, room_members, socketInfo) {
        socket.on('chatHistory', (data) => {
            console.log('ChatHistory');

            if (!data.opponentId && !data.userId) {
                io.to(socket.id).emit('chatHistory', { success: Constant.FALSE, message: Constant.PARAMSMISSINGCHATHISTORY });
            }
            else {
                conversationModel.findOne({
                    $or: [{ $and: [{ sender_id: data.opponentId }, { reciever_id: data.userId }] },
                    { $and: [{ sender_id: data.userId }, { reciever_id: data.opponentId }] }
                    ]
                }).then(conversation => {
                    let convId = ""
                    if (conversation) {
                        convId = conversation._id
                    } else {
                        const conversationSchema = new conversationModel({
                            sender_id: data.opponentId,
                            reciever_id: data.userId
                        })

                        convId = conversationSchema._id

                        conversationSchema.save({}).then()
                    }

                    messageModel.find({

                        singleDelete: { $nin: [data.userId] },
                        $or: [
                            {
                                "to": data.userId,
                                "from": data.opponentId,
                                // "isBlocked": false,
                            },
                            {
                                "to": data.opponentId,
                                "from": data.userId,
                                // "is_deleted": false
                            }
                        ]

                        // $or: [{ $and: [{ isBlocked: true }, { from: data.userId }] },
                        // { conversationId: convId, isBlocked: false, "is_deleted": false }],
                        // message: { $ne: "" }
                    }).populate('from to').then(async result => {

                        messageModel.updateMany({
                            readBy: { $ne: data.userId },
                            $or: [{ $and: [{ isBlocked: true }, { from: data.userId }] }, { conversationId: convId, isBlocked: false }]
                        }, { $push: { readBy: data.userId } }, { multi: true }).then(
                            async  update => {
                                socket.join(convId, function () {
                                    room_members[convId] = io.sockets.adapter.rooms[convId].sockets
                                })
                            })
                        var isOnline;
                        // console.log(result[0]);


                        if (socketInfo.hasOwnProperty(data.opponentId))
                            isOnline = true
                        else
                            isOnline = false
                        let block;
                        const isBlocked = await blockModel.findOne({
                            $or: [
                                { blockedBy: data.userId, blocked: data.opponentId },
                                { blockedBy: data.opponentId, blocked: data.userId }
                            ]
                        })
                        let blockedId = ''
                        if (isBlocked) {
                            block = 1
                            blockedId = isBlocked.blockedBy
                        }
                        else { block = 0 }
                        io.to(socket.id).emit('isOnline', { isOnline: isOnline });
                        io.to(socket.id).emit('chatHistory', { userBlocked: block, blockedId: blockedId, success: Constant.TRUE, message: result, isOnline: isOnline, conversationId: convId });
                    }).catch(err => {

                        if (err.name == 'ValidationError' || 'CastError')
                            io.to(socket.id).emit('chatHistory', { error: Constant.OBJECTIDERROR, success: Constant.FALSE })
                        else
                            io.to(socket.id).emit('chatHistory', { success: Constant.FALSE, message: err });
                    })
                })
            }
        })
    }

    //Get Chat History for one to one chat

    groupChatHistory(socket, io, room_members) {
        socket.on('groupChatHistory', async data => {
            if (!data.userId) {
                io.to(socket.id).emit('groupChatHistory', { success: Constant.FALSE, message: Constant.PARAMSMISSINGGROUPCHATHISTORY });
            }
            else {


                messageModel.updateMany({ group_id: data.groupId, readBy: { $ne: data.userId } }, { $push: { readBy: data.userId } }, { multi: true }).then(conversation => {

                    socket.join(data.groupId, function () {
                        room_members[data.groupId] = io.sockets.adapter.rooms[data.groupId].sockets


                    })

                    messageModel.find({ conversationId: data.groupId, groupDelete: { $nin: [data.userId] } }).populate('from').then(async result => {


                        const members = await groupModel.findOne({ _id: data.groupId, members: data.userId })
                        var isMember
                        if (members)
                            isMember = 1
                        else
                            isMember = 0
                        io.to(socket.id).emit('chatHistory', { success: Constant.TRUE, message: result, isMember: isMember, conversationId: data.groupId });
                    }).catch(err => {

                        if (err.name == 'ValidationError' || 'CastError')
                            io.to(socket.id).emit('chatHistory', { error: Constant.OBJECTIDERROR, success: Constant.FALSE })
                        else
                            io.to(socket.id).emit('chatHistory', { success: Constant.FALSE, message: err });
                    })
                })


            }
        })
    }

    // Get chatlist of a particular user

    chatList(socket, io, socketInfo) {
        socket.on('chatList', data => {

            var id = data.userId
            if (!id) {
                io.to(socket.id).emit('chatList', { success: Constant.FALSE, message: Constant.PARAMSMISSING })

            }
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
                            "type": { $last: "$type" },

                            "message": { $last: "$message" },
                            "messageType": { $last: "$messageType" },
                            "group": { $last: { $arrayElemAt: ["$group", 0] } },
                            "to": { $last: { $arrayElemAt: ["$to", 0] } },
                            "from": { $last: { $arrayElemAt: ["$from", 0] } },
                            "conversationId": { $first: "$conversationId" },
                            "date": { $last: "$date" },
                            unreadCount: { $sum: { $cond: { if: { $in: [mongoose.Types.ObjectId(id), "$readBy"] }, then: 0, else: 1 } } } //{ $cond: { if: "$readBy", then: "$to", else: {} } },

                        }
                    }, {
                        $project: {
                            "_id": 0,
                            "messageId": 1,
                            "message": 1,
                            "group": {
                                $cond: { if: "$group", then: "$group", else: {} }
                            },
                            date: 1,
                            "sender": 1,
                            type: 1,
                            conversationId: 1,
                            "to": { $cond: { if: "$to", then: "$to", else: {} } },
                            "from": 1,
                            unreadCount: 1,
                            messageType: 1,
                            chatName: { $cond: { if: "$group", then: "$group", else: { $cond: { if: { $eq: ["$from._id", mongoose.Types.ObjectId(id)] }, then: "$to", else: "$from" } } } }
                        }
                    },
                    { $sort: { "date": -1 } }
                ]).then(result => {


                    result.map(value => {
                        if (socketInfo.hasOwnProperty(value.chatName._id))
                            value.isOnline = true
                        else
                            value.isOnline = false
                        return value
                    })



                    io.to(socket.id).emit('chatList', { success: Constant.TRUE, chatList: result, message: Constant.TRUEMSG })
                }).catch(err => {
                    console.log(err);

                    if (err)
                        io.to(socket.id).emit('chatList', { success: Constant.FALSE, message: err })

                })
            })
        })
    }

    //emiting typing to a group or particular user

    typing(socket, io) {
        socket.on('typing', data => {
            userModel.findOne({ _id: data.from }).select('firstName lastName').then(user => {
                user.set('isTyping', data.isTyping, { strict: false })
                io.in(data.conversationId).emit('typing', { success: Constant.TRUE, from: user })
            })

        })
    }


    activeUsers(socket, io, socketInfo) {

        socket.on('activeUsers', data => {
            var activeUsers = []
            for (var key in socketInfo) {
                activeUsers.push(key)
            }


            io.to(socket.id).emit('activeUsers', { success: Constant.TRUE, activeUsers: activeUsers })
        })

    }


    userOnline(socket, io, socketInfo) {

    }

    //online User
    isOnline(socket, io, socketInfo) {
        socket.on('isOnline', data => {
            console.log(data, 'isOnline')
            if (!data.opponentId) {
                io.to(socket.id).emit('isOnline', { success: Constant.FALSE, message: Constant.OPPOMISSING });
            } else {
                var isOnline;
                if (socketInfo.hasOwnProperty(data.opponentId))
                    isOnline = true
                else
                    isOnline = false
                userModel.findById(data.opponentId).then(user => {
                    console.log(user)
                    io.to(socket.id).emit('isOnline', { isOnline: data.status, isOnline: isOnline, onlineTime: user.lastOnline });
                })
            }
        })
    }


    deleteMessage(socket, io) {
        socket.on('deleteMessage', async data => {
            if (!data.messageId)
                io.to(socket.id).emit('deleteMessage', { success: Constant.FALSE, message: Constant.MESSAGEDELETE })
            else {
                let setMessageFalse = await messageModel.findOneAndUpdate({ _id: data.messageId }
                    , { $set: { is_deleted: true } })

                let query = {}
                if (data.type == 1)
                    query = { $addToSet: { singleDelete: data.userId } }
                else
                    query = { $addToSet: { groupDelete: data.userId } }

                messageModel.findOneAndUpdate({ _id: data.messageId }, query, { multi: true, new: true }).then(updateResult => {
                    if (updateResult) {
                        console.log({ message: "DELETE MESSAGE", success: Constant.TRUE, messageId: updateResult._id });

                        // io.to(socket.id).emit('listenMessage', { success: Constant.TRUE, messageId: updateResult._id })
                        io.to(socket.id).emit('deleteMessage', { success: Constant.TRUE, messageId: updateResult._id })
                    }
                    else
                        io.to(socket.id).emit('deleteMessage', { success: Constant.FALSE, messageId: updateResult._id })
                })

            }
        })
    }


    // Change Read Status of messages

    isRead(socket, io, socketInfo) {
        socket.on('isRead', data => {
            console.log('isRead');

            if (!data.userId && !data.conversationId)
                io.to(socket.id).emit('isRead', { success: Constant.FALSE, message: Constant.PARAMSMISSING })
            else {
                messageModel.update({ conversationId: data.conversationId, readBy: { $ne: data.userId }, isBlocked: false }, { $push: { readBy: data.userId } }, { multi: true }).then(updateResult => {
                    if (data.messageType == 'group')
                        io.in(data.groupId).emit('isRead', { success: Constant.TRUE })
                    else
                        io.to(socketInfo[data.opponentId]).emit('isRead', { success: Constant.TRUE })
                })
            }
        })
    }

    leaveGroup(socket, io, socketInfo) {

        socket.on('leaveGroup', async data => {
            console.log('leaveGroup');
            let { groupId, userId } = data
            if (!data.groupId || !data.userId) {
                io.to(socket.id).emit('leaveGroup', { success: Constant.FALSE, message: Constant.GROUPUSERMISSING })

            }
            else {
                let data = await groupModel.findOne({ _id: groupId })
                let userTobeadmin = data.members[0]

                if (data.admin == userId) {
                    groupModel.findOneAndUpdate({ _id: groupId },
                        { $pull: { members: userId } }, { new: true }
                    ).then(data => {

                        groupModel.findOneAndUpdate({ _id: groupId }, { $set: { admin: userTobeadmin } }, { new: true })
                            .then(update => {
                                io.to(socket.id).emit('leaveGroup', { success: Constant.TRUE, message: "Exited Successfully" })
                                // delete socketInfo[socket.userId];

                            })
                    }).catch(err => {
                        console.log(err);
                        io.to(socket.id).emit('leaveGroup', { success: Constant.FALSE, message: "Exited Successfully" })

                    })
                }
                else {
                    groupModel.findOneAndUpdate({ _id: groupId },
                        { $pull: { members: userId } }, { new: true }
                    ).then(data => {
                        io.to(socket.id).emit('leaveGroup', { success: Constant.TRUE, message: "Exited Successfully" })
                        // delete socketInfo[socket.userId];
                    }).catch(err => {
                        console.log(err);
                        io.to(socket.id).emit('leaveGroup', { success: Constant.FALSE, message: err })

                    })
                }


            }
        })

    }

    deleteConversation(socket, io, socketInfo) {
        socket.on('deleteConversation', async data => {
            let { userId, conversationId } = data
            if (!userId)
                io.to(socket.id).emit('deleteConversation', { success: Constant.FALSE, message: Constant.PARAMSMISSING })
            else {
                messageModel.updateMany({ conversationId: conversationId },
                    { $addToSet: { deleteConverstation: data.userId } }).then(result => {
                        io.to(socket.id).emit('deleteConversation', { success: Constant.TRUE, conversationId: conversationId, message: "Deleted Successfully" })
                    }).catch(err => {
                        console.log(err);
                        io.to(socket.id).emit('deleteConversation', { success: Constant.FALSE, message: err })


                    })
            }
        })
    }

    clearBadge(socket, io, socketInfo) {
        socket.on('clearBadge', async data => {
            let { userId } = data
            if (!userId)
                io.to(socket.id).emit('clearBadge', { success: Constant.FALSE, message: Constant.PARAMSMISSING })
            else {
                userModel.findOneAndUpdate({ _id: userId }, { $set: { badge: 0 } }, { new: true }).then(clear => {
                    io.to(socket.id).emit('clearBadge', { success: Constant.TRUE, message: Constant.CLEARED })
                }).catch(err => {
                    console.log(err);
                    io.to(socket.id).emit('clearBadge', { success: Constant.FALSE, message: err })


                })
            }
        })
    }
    blockUser(socket, io, socketInfo) {
        socket.on('blockUser', async data => {


            let query = { blocked: data.blocked, blockedBy: data.blockedBy };
            blockModel.findOne(query).then(
                result => {
                    if (result) {
                        blockModel.deleteOne(query).then(res => {
                            io.to(socket.id).emit('blockUser', { success: Constant.TRUE, isBlocked: 0, message: "user is unblocked" })


                            io.to(socketInfo[data.blocked]).emit('blockUser', { success: Constant.TRUE, isBlocked: 0, message: "You are unblocked" })
                        });
                    } else {
                        let follower = new blockModel(query);
                        follower.save(err => {
                            if (err) return reject(err);
                            io.to(socket.id).emit('blockUser', { success: Constant.TRUE, blockedId: data.blockedBy, isBlocked: 1, message: "user is blocked" })

                            io.to(socketInfo[data.blocked]).emit('blockUser', { success: Constant.TRUE, blockedId: data.blockedBy, isBlocked: 1, message: "You are blocked" })

                        });
                    }
                },
                err => {
                    io.to(socket.id).emit('blockUser', { success: Constant.FALSE, message: err })
                }
            );
        })
    }





}

module.exports = socketController;
