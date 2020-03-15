const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let conversationSchema = new Schema({
    sender_id: { type: Schema.Types.ObjectId, ref: 'user' },// sender's  ID
    reciever_id: { type: Schema.Types.ObjectId, ref: 'user' },// reciever's  ID
    group_id: { type: Schema.Types.ObjectId, ref: 'group' } // group's ID
});



let conversation = mongoose.model("conversation", conversationSchema);

module.exports = conversation;
