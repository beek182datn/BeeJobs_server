var db = require("../config/db");
const chatRoom = new db.mongoose.Schema(
    {
        userIds: { type: [String], default: [] },
    },
    {
        collection: "ChatRooms",
    }
);

const ChatRoom = db.mongoose.model("ChatRooms", chatRoom);

module.exports = { ChatRoom };
