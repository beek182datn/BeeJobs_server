var db = require("../config/db");
const message = new db.mongoose.Schema(
    {
        chatRoomId: { type: String, required: true },
        content: { type: String, required: true },
        senderId: { type: String, required: true },
        createdAt: { type: String, required: true }
    },
    {
        collection: "Messages",
    }
);

const Message = db.mongoose.model("Messages", message);

module.exports = { Message };
