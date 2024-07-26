var db = require("../config/db");
const chatRoom = new db.mongoose.Schema(
    {
        _id: { type: db.mongoose.Schema.Types.ObjectId},
        userIds: { type: [String], default: [] },
    },
    {
        collection: "ChatRooms",
    }
);

const ChatRoom = db.mongoose.model("ChatRooms", chatRoom);

module.exports = { ChatRoom };
