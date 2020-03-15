const socketController = require('../Socket/socketController')
const moment = require('moment')
const soc = new socketController();
const Constant = require('../constants/constant')

module.exports = (io) => {
    var socketInfo = {};
    var rooms = [];
    var room_members = {}
    io.on('connection', function (socket) {
        console.log("someone connected");

        socket.on('disconnect', function () {
            //Disconnecting the socket
            // soc.addOnlineTime(socket.username).then({})
            delete socketInfo[socket.username];
            console.log('disconnect', socketInfo, `${socket.username}`);
            io.emit(`${socket.username}_status`, { status: false, onlineTime: moment().valueOf() });

            io.emit('userOnline', { userId: socket.username, isOnline: Constant.FALSE, onlineTime: moment().valueOf() })

        });

        soc.sendMessage(socket, io, socketInfo, room_members) //Send Message
        soc.addUsername(socket, io, socketInfo) //Add username to corresponding socketID
        soc.chatHistory(socket, io, room_members, socketInfo)   //get Chat History
        soc.chatList(socket, io, socketInfo) // get chat list of signed in user 
        soc.typing(socket, io) // user  is typing on other end
        soc.isRead(socket, io, socketInfo) // check if message is read
        soc.userList(socket, io)
        soc.userOnline(socket, io, socketInfo)
        soc.isOnline(socket, io, socketInfo)
        soc.deleteMessage(socket, io)
        soc.activeUsers(socket, io, socketInfo)
        soc.groupChatHistory(socket, io, room_members) // fetch group chat history
        soc.leaveGroup(socket, io, room_members) // leave group
        soc.deleteConversation(socket, io, room_members) // Delete Conversation
        soc.clearBadge(socket, io, room_members) // Delete Conversation
        soc.blockUser(socket, io, socketInfo) // Delete Conversation



    })

}




