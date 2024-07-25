const { Message } = require('../../model/Messages')
const { ChatRoom } = require('../../model/ChatRooms')

exports.getMessagesByRoomId = async (req, res) => {
    const { chatroomId } = req.params;

    try {
        const messages = await Message.find({ chatRoomId: chatroomId }).populate('senderId', 'name avatar');
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
}

exports.getChatRoomInfo = async (req, res) => {
    const { senderId, receiverId } = req.params;

    try {
        const chatroom = await ChatRoom.findOne({ userIds: { $all: [senderId, receiverId] } });

        if (!chatroom) {
            return res.status(404).json({ message: 'Chatroom not found' });
        }

        res.json(chatroom);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
}

exports.getMessages = async (req, res) => {
    const { senderId, receiverId } = req.params;

    try {
        const chatroom = await ChatRoom.findOne({ userIds: { $all: [senderId, receiverId] } });

        if (!chatroom) {
            chatroom = new ChatRoom({ userIds: [receiverId, senderId] });
            await chatroom.save();
        }

        const messages = await Message.find({ chatRoomId: chatroom._id }).populate('senderId', 'name avatar').lean();;

        // Gửi thông báo rằng người dùng đã tham gia phòng chat
        req.app.get('io').to(chatroom._id).emit('message', {
            content: `${senderId} đã tham gia phòng chat`,
            senderId: senderId, // Hoặc một giá trị bất kỳ để xác định đây là thông báo hệ thống
            chatRoomId: chatroom._id,
            createdAt: new Date().toString(),
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
}

exports.sendMessage = async (req, res) => {
    const { senderId, receiverId } = req.params;
    const { content } = req.body;

    try {
        let chatroom = await ChatRoom.findOne({ userIds: { $all: [receiverId, senderId] } });

        if (!chatroom) {
            chatroom = new ChatRoom({ userIds: [receiverId, senderId] });
            await chatroom.save();
        }

        const message = new Message({
            content,
            senderId: senderId,
            chatRoomId: chatroom._id,
            createdAt: new Date().toString()
        });

        await message.save();

        // Gửi tin nhắn qua Socket.IO
        // req.app.get('io').to(chatroom._id).emit('newMessage', message);

        res.json(message);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
}
