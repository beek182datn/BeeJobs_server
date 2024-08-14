const { Message } = require("../../model/Messages");
const { ChatRoom } = require("../../model/ChatRooms");
const { UserRoleModel } = require("../../model/Users_Roles");
const { RoleModel } = require("../../model/Roles");
const { json } = require("body-parser");
const { userModel } = require("../../model/Users");
const { companyModel } = require("../../model/Companies");
const WorkerMD = require("../../model/Workers");

exports.getMessagesByRoomId = async (req, res) => {
    const { chatroomId } = req.params;

    try {
        const messages = await Message.find({ chatRoomId: chatroomId }).populate(
            "senderId",
            "name avatar"
        );
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

exports.getChatRoomInfo = async (req, res) => {
    const { senderId, receiverId } = req.params;

    try {
        const chatroom = await ChatRoom.findOne({
            userIds: { $all: [senderId, receiverId] },
        });

        if (!chatroom) {
            return res.status(404).json({ message: "Chatroom not found" });
        }

        res.json(chatroom);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

exports.getMessages = async (req, res) => {
    const { senderId, receiverId } = req.params;

    try {
        let chatroom = await ChatRoom.findOne({
            userIds: { $all: [senderId, receiverId] },
        });

        if (!chatroom) {
            // try {
            //     chatroom = new ChatRoom({ userIds: [receiverId, senderId] });
            //     await chatroom.save();
            // } catch (saveError) {
            //     console.error("Error saving chatroom:" + ' - ' + receiverId + ' - ' + senderId, saveError);
            //     return res.status(500).json({ message: "Error saving chatroom", error: saveError });
            // }
            res.json([]);
            return;
        }

        const messages = await Message.find({ chatRoomId: chatroom._id }).populate('senderId', 'name avatar').lean();

        // Gửi thông báo rằng người dùng đã tham gia phòng chat
        req.app
            .get("io")
            .to(chatroom._id)
            .emit("message", {
                content: `${senderId} đã tham gia phòng chat`,
                senderId: senderId, // Hoặc một giá trị bất kỳ để xác định đây là thông báo hệ thống
                chatRoomId: chatroom._id,
                createdAt: new Date().toString(),
            });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};
exports.sendMessage = async (req, res) => {
    const { senderId, receiverId } = req.params;
    const { content } = req.body;

    try {
        let chatroom = await ChatRoom.findOne({
            userIds: { $all: [receiverId, senderId] },
        });

        if (!chatroom) {
            try {
                chatroom = new ChatRoom({ userIds: [receiverId, senderId] });
                await chatroom.save();
            } catch (saveError) {
                console.error("Error saving chatroom:" + ' - ' + receiverId + ' - ' + senderId, saveError);
                return res.status(500).json({ message: "Error saving chatroom", error: saveError });
            }
        }

        const message = new Message({
            content,
            senderId: senderId,
            chatRoomId: chatroom._id,
            createdAt: new Date().toString(),
        });

        await message.save();

        // Gửi tin nhắn qua Socket.IO
        // req.app.get("io").to(chatroom._id).emit("message", message);

        res.json(message);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

exports.checkChatRoom = async (req, res) => {
    const { senderId, receiverId } = req.params;

    try {
        let chatroom = await ChatRoom.findOne({
            userIds: { $all: [receiverId, senderId] },
        });

        if (!chatroom) {
            try {
                chatroom = new ChatRoom({ userIds: [receiverId, senderId] });
                await chatroom.save();
            } catch (saveError) {
                console.error("Error saving chatroom:" + ' - ' + receiverId + ' - ' + senderId, saveError);
                return res.status(500).json({ message: "Error saving chatroom", error: saveError });
            }
        }

        res.json(chatroom);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

exports.userInfo = async (req, res) => {
    const userId = req.params.userId;
    try {
        let avatar = '';
        let fullname = '';
        let type = '';
        let userRole = await UserRoleModel.findOne({ id_User: userId });
        if (!userRole) {
            res.status(401).json({ message: "Not found", userRole });
        }
        let role = await RoleModel.findOne({ _id: userRole.id_Role });
        if (!role) {
            res.status(401).json({ message: "Not found", role });
        }

        if (role.Code === 'NLD') {
            let worker = await WorkerMD.findOne({ user_id: userId });
            if (!worker) {
                res.status(401).json({ message: "Not found NLD", worker });
            }
            avatar = worker.worker_avatar;
            fullname = worker.worker_name;
            type = role.Code;
        } else if (role.Code === 'ADMIN') {
            let admin = await userModel.findOne({_id: userId});
            if (!admin) {
                res.status(401).json({ message: "Not found admin", admin });
            }
            avatar = admin.avata;
            fullname = admin.full_name;
            type = role.Code;
        } else if (role.Code === 'DN') {
            let company = await companyModel.findOne({ user_id: userId });
            if (!company) {
                res.status(401).json({ message: "Not found DN", company });
            }
            avatar = company.company_logo;
            fullname = company.company_name;
            type = role.Code;
        }

        res.json({
            userId: userId,
            avatar: avatar,
            name: fullname,
            role: type,
        })

    } catch (error) {
        res.status(500).json({ message: "Lỗi", error });
    }

}
