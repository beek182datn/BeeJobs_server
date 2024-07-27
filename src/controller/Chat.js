const { Message } = require("../model/Messages");
const { ChatRoom } = require("../model/ChatRooms");
const { userModel } = require("../model/Users");
const { UserRoleModel } = require("../model/Users_Roles");
const { RoleModel } = require("../model/Roles");

exports.getChatroomsByAdminId = async (req, res) => {
    try {
      const adminID = res.locals.userInfo._id; // Sử dụng thông tin admin từ res.locals.userInfo
      if (!adminID) {
        return res.status(400).send({ message: "Admin ID không hợp lệ." });
      }
  
      const chatRooms = await ChatRoom.find({ userIds: adminID });
      if (!chatRooms.length) {
        return res.render('Chat/index', {
          chatRooms: [],
          adminID: adminID,
          message: "Không tìm thấy phòng chat nào."
        });
      }
  
      // Lấy thông tin chi tiết của người dùng trong mỗi phòng chat
      const detailedChatRooms = await Promise.all(chatRooms.map(async (chatRoom) => {
        const otherUserId = chatRoom.userIds.find(id => id.toString() !== adminID.toString());
        if (!otherUserId) {
          return {
            ...chatRoom.toObject(),
            otherUserName: null,
            otherUserAvatar: null
          };
        }
  
        const otherUser = await userModel.findOne({_id: otherUserId}).select('full_name avata');
        if (!otherUser) {
          return {
            ...chatRoom.toObject(),
            otherUserName: null,
            otherUserAvatar: null
          };
        }
        
        let objUserRole = await UserRoleModel.findOne({id_User: otherUser._id});

          if (!objUserRole) {
            return {
                ...chatRoom.toObject(),
                otherUserName: null,
                otherUserAvatar: null,
                otherUserRole: null
              };
            };

            let objRole = await RoleModel.findOne({_id: objUserRole.id_Role})
        return {
          ...chatRoom.toObject(),
          otherUserName: otherUser.full_name,
          otherUserAvatar: otherUser.avata,
          otherUserRole: objRole.Name
        };
      }));
  
      res.render('Chat/index', {
        chatRooms: detailedChatRooms,
        adminID: adminID,
        message: detailedChatRooms.length ? "Lấy danh sách phòng chat thành công!" : "Không tìm thấy phòng chat nào."
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Đã xảy ra lỗi trong quá trình xử lý." });
    }
  };
  
exports.createChatRoom = async (req, res) => {
  const { userID } = req.body;
  const adminID = res.locals.userInfo._id; // Sử dụng thông tin admin từ res.locals.userInfo

  try {
    const admin = await userModel.findById(adminID);
    const user = await userModel.findById(userID);

    if (!admin || !user) {
      return res.status(400).json({ message: "Người dùng không tồn tại" });
    }

    const existingChatRoom = await ChatRoom.findOne({
      userIds: { $all: [adminID, userID], $size: 2 }
    });

    if (existingChatRoom) {
      return res.status(200).json({
        data: existingChatRoom,
        message: "Phòng chat đã tồn tại!"
      });
    }

    const newChatRoom = new ChatRoom({ userIds: [adminID, userID] });
    await newChatRoom.save();

    res.status(201).json({
      data: newChatRoom,
      message: "Phòng chat mới đã được tạo thành công!"
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi: " + error.message });
  }
};

exports.getMessagesByChatRoomId = async (req, res) => {
    const { chatRoomId } = req.params;
  
    try {
      const messages = await Message.find({ chatRoomId }).sort({ createdAt: 1 });
      const users = await userModel.find({
        _id: { $in: messages.map(msg => msg.senderId) }
      }).select('full_name avata');
  
      const userMap = users.reduce((acc, user) => {
        acc[user._id] = user;
        return acc;
      }, {});
  
      const messagesWithUserInfo = messages.map(msg => ({
        ...msg.toObject(),
        senderName: userMap[msg.senderId].full_name,
        senderAvatar: userMap[msg.senderId].avata
      }));
  
      res.status(200).json({
        messages: messagesWithUserInfo,
        message: messages.length ? "Lấy danh sách tin nhắn thành công!" : "Không có tin nhắn nào trong phòng chat này."
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi: " + error.message });
    }
  };

  exports.sendMessage = async (req, res) => {
    const { chatRoomId } = req.params;
    const { content } = req.body;
    const senderId = res.locals.userInfo._id; // Sử dụng thông tin admin từ res.locals.userInfo
  
    try {
      const newMessage = new Message({
        chatRoomId,
        content,
        senderId,
        createdAt: new Date(),
      });
  
      await newMessage.save();
  
      const sender = await userModel.findById(senderId).select('full_name avata');
  
      res.status(201).json({
        message: {
          ...newMessage.toObject(),
          senderName: sender.full_name,
          senderAvatar: sender.avata,
        },
        messageText: "Gửi tin nhắn thành công!"
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi: " + error.message });
    }
  };

exports.searchUsers = async (req, res) => {
  const { query } = req.query;
  try {
    const users = await userModel.find({
      $or: [
        { full_name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('full_name email');
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Error: ' + error.message });
  }
};
exports.getAllUsers = async (req, res) => {
    try {
      const users = await userModel.find().select('full_name email');
      res.status(200).json({ users });
    } catch (error) {
      res.status(500).json({ message: 'Error: ' + error.message });
    }
  };