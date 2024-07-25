const { Message } = require("../../model/Messages");
const { ChatRoom } = require("../../model/ChatRooms");
const WorkerMD = require("../../model/Workers");

exports.getChatroomByCompanyId = async (req, res) => {
  const { companyId } = req.params;

  try {
    const chatRooms = await ChatRoom.find({ companyId: companyId });

    res.status(200).json({
      data: chatRooms,
      message: chatRooms.length
        ? "Lấy danh sách phòng chat thành công!"
        : "Không tìm thấy phòng chat nào cho người dùng này.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi: " + error.message,
    });
  }
};

exports.getChatroomByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    // Lấy danh sách các phòng chat có chứa userId
    const chatRooms = await ChatRoom.find({ userIds: userId });

    // Xử lý dữ liệu phòng chat để thêm trường myID, otherID, thông tin worker và tin nhắn cuối cùng
    const formattedChatRooms = await Promise.all(
      chatRooms.map(async (chatRoom) => {
        const { userIds, _id } = chatRoom;
        const myID = userId;
        const otherID = userIds.find((id) => id !== userId) || null;

        let workerDetails = {};
        let lastMessage = null;
        if (otherID) {
          // Lấy thông tin worker dựa trên otherID
          workerDetails = await WorkerMD.findOne({ user_id: otherID }).select(
            "worker_name worker_avatar"
          );
        }

        // Lấy tin nhắn cuối cùng trong phòng chat
        const messages = await Message.find({ chatRoomId: _id })
          .sort({ createdAt: -1 })
          .limit(1);
        if (messages.length > 0) {
          lastMessage = messages[0];
        }

        return {
          _id,
          myID,
          otherID,
          worker_name: workerDetails.worker_name || null,
          worker_avatar: workerDetails.worker_avatar || null,
          userIds,
          lastMessage: lastMessage.content, // Thêm tin nhắn cuối cùng vào kết quả trả về
        };
      })
    );

    res.status(200).json({
      data: formattedChatRooms,
      message: formattedChatRooms.length
        ? "Lấy danh sách phòng chat thành công!"
        : "Không tìm thấy phòng chat nào cho người dùng này.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi: " + error.message,
    });
  }
};

exports.getMessageByChatroomId = async (req, res) => {
  const { chatRoomId } = req.params;

  try {
    const messages = await Message.find({ chatRoomId }).sort({ createdAt: 1 });

    res.status(200).json({
      data: messages,
      message: messages.length
        ? "Lấy danh sách tin nhắn thành công!"
        : "Không có tin nhắn nào trong phòng chat này.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi: " + error.message,
    });
  }
};

exports.sendMessage = async (req, res) => {
  const { chatRoomId, content, senderId } = req.body;

  if (!chatRoomId || !content || !senderId) {
    return res.status(400).json({
      message:
        "Yêu cầu không hợp lệ, vui lòng cung cấp đầy đủ thông tin: chatRoomId, content, senderId.",
    });
  }

  try {
    const newMessage = new Message({
      chatRoomId,
      content,
      senderId,
      createdAt: new Date(),
    });

    await newMessage.save();

    req.app.get("io").to(chatRoomId).emit("message", newMessage);

    res.status(201).json({
      data: newMessage,
      message: "Gửi tin nhắn thành công!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi: " + error.message,
    });
  }
};

exports.deleteMessage = async (req, res) => {
  const { messageId, userId } = req.params;

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        message: "Tin nhắn không tồn tại.",
      });
    }

    if (message.senderId !== userId) {
      return res.status(403).json({
        message: "Bạn không có quyền xóa tin nhắn này.",
      });
    }

    await Message.findByIdAndDelete(messageId);

    res.status(200).json({
      message: "Xóa tin nhắn thành công!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi: " + error.message,
    });
  }
};

exports.deleteMessagesInChatroom = async (req, res) => {
  const { chatRoomId } = req.params;

  try {
    const result = await Message.deleteMany({ chatRoomId: chatRoomId });

    res.status(200).json({
      message: `Đã xóa ${result.deletedCount} tin nhắn trong phòng chat.`,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi: " + error.message,
    });
  }
};
