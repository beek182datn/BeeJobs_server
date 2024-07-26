const { Message } = require("../../model/Messages");
const { ChatRoom } = require("../../model/ChatRooms");
const WorkerMD = require("../../model/Workers");
const { companyModel } = require("../../model/Companies");
const { userModel } = require("../../model/Users");
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

exports.createChatRoom = async (req, res) => {
  const { companyID, userID } = req.body;

  try {
    // Kiểm tra sự tồn tại của company và worker
    const company = await companyModel.findById(companyID);
    const worker = await userModel.findById(userID);

    if (!company || !worker) {
      return res
        .status(400)
        .json({ message: "Doanh nghiệp hoặc người dùng không tồn tại" });
    }

    // Kiểm tra xem phòng chat giữa hai ID đã tồn tại chưa
    const existingChatRoom = await ChatRoom.findOne({
      userIds: { $all: [companyID, userID], $size: 2 },
    });

    if (existingChatRoom) {
      return res.status(200).json({
        data: existingChatRoom,
        message: "Phòng chat đã tồn tại!",
      });
    }

    // Tạo phòng chat mới
    const newChatRoom = new ChatRoom({ userIds: [companyID, userID] });
    await newChatRoom.save();

    res.status(201).json({
      data: newChatRoom,
      message: "Phòng chat mới đã được tạo thành công!",
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

        // Kiểm tra xem phòng chat có chứa ít nhất một tin nhắn không
        const messages = await Message.find({ chatRoomId: _id })
          .sort({ createdAt: -1 })
          .limit(1);

        if (messages.length === 0) {
          return null; // Bỏ qua phòng chat không có tin nhắn
        }

        let workerDetails = {};
        let lastMessage = null;
        if (otherID) {
          // Lấy thông tin worker dựa trên otherID
          workerDetails = await WorkerMD.findOne({ user_id: otherID }).select(
            "worker_name worker_avatar"
          );
        }

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
          lastMessage: lastMessage ? lastMessage.content : null, // Thêm tin nhắn cuối cùng vào kết quả trả về
        };
      })
    );

    // Loại bỏ các phần tử null (các phòng chat không có tin nhắn)
    const filteredChatRooms = formattedChatRooms.filter(
      (chatRoom) => chatRoom !== null
    );

    res.status(200).json({
      data: filteredChatRooms,
      message: filteredChatRooms.length
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
    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({
        message: "Phòng chát không tồn tại",
      });
    }

    const messages = await Message.find({ chatRoomId });

    const messagesWithWorkerInfo = await Promise.all(
      messages.map(async (message) => {
        const worker = await WorkerMD.findOne({
          user_id: message.senderId,
        }).select("worker_name worker_avatar");

        return {
          ...message._doc,
          worker_name: worker ? worker.worker_name : null,
          worker_avatar: worker ? worker.worker_avatar : null,
        };
      })
    );

    res.status(200).json({
      data: messagesWithWorkerInfo,
      message: messagesWithWorkerInfo.length
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
