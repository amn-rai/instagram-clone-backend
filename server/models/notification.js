var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var notificationSchema = new Schema({
    receiverId: { type: mongoose.Schema.ObjectId, ref: 'users', required: true },
    title: { type: String },
    notificationType: { type: Number },
    time: Number
});
module.exports = mongoose.model('Notifications', notificationSchema);
