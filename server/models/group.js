const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let groupSchema = new Schema({

    groupName: { //name of Group
        type: String,

    },
    members: [{ type: Schema.Types.ObjectId, ref: 'user' }],// members array,
    createdBy: { type: Schema.Types.ObjectId, ref: 'user' }, // creator of group 
    admin: { type: Schema.Types.ObjectId, ref: 'user' }, // default admin who creates the group
    date: {
        type: Number                                        //Creation Date for Group
    },
    image: { type: String },
    isActive: {                                      // Group Exists or deleted
        type: Number,
        default: 1
    }

});
let group = mongoose.model("group", groupSchema);
module.exports = group;
