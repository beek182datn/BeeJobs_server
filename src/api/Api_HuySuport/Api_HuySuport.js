var userMD = require("../../model/Users");
var roleMD = require("../../model/Roles");
const WorkerMD = require('../../model/Workers');
var userRoleMD = require("../../model/Users_Roles");
const { Message } = require("../../model/Messages");
const { ChatRoom } = require("../../model/ChatRooms");
const { companyModel } = require("../../model/Companies");
const _ = require("lodash");
var bcrypt = require("bcrypt");
var { jwtMiddleware, createJWT, checkJWT } = require("../../middleware/JWT");
var { sendOtp, verifyOtp } = require("../../middleware/MailerSevice");
const { MAIL_TYPE } = require("../../config/Mailer_Config");
const {
  hashPassword,
  checkPassword,
} = require("../../middleware/hashEveryone");

var objReturn = {
  status: 1,
  msg: " ",
  token: " ",
  user_info: " ",
  createBy: "Hệ Thống",
};
var user_info = {
  Role: "",
};

exports.Huy_api_ForgotPasswords = async (req, res) => {
  let objReturn = { status: 500, msg: "Có lỗi xảy ra" }; // Initialize response object

  if (req.method == "POST") {
    try {
      const { email } = req.body;

      // Check if the email exists in the database
      const checkEmail = await userMD.userModel.findOne({ email: email });

      if (checkEmail) {
        await sendOtp(email, MAIL_TYPE.OTP_FogotPassword);
        objReturn.status = 200;
        objReturn.msg = "Xác thực thành công";
      } else {
        // Handle case when email is not registered
        objReturn.status = 404;
        objReturn.msg = "Email chưa được đăng ký";
      }
    } catch (error) {
      console.log(error);
      objReturn.status = 500;
      objReturn.msg = "Có lỗi xảy ra trong quá trình xử lý";
    }
  }

  res.json(objReturn);
};

// Lấy thông tin người dùng dựa trên user_id
exports.getWorkerbyUserID = async (req, res) => {
  try {
    const user = await WorkerMD.findOne({ user_id: req.params.user_id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.checkUserId = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const user = await userMD.userModel.findOne({ _id: user_id });

    if (!user) {
      return res.status(200).json({
        registered: false,
        message: "User chưa đăng ký .",
        createdBy: "Hệ thống",
      });
    }

    return res.status(200).json({
      registered: true,
      data: user,
      message: "User đã đăng ký.",
      createdBy: "Hệ thống",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi: " + error.message,
      createdBy: "Hệ thống",
    });
  }
};
exports.getChatroomByUserIdForWorker = async (req, res) => {
  const { userId } = req.params;

  try {
    // Lấy danh sách các phòng chat có chứa userId
    const chatRooms = await ChatRoom.find({ userIds: userId });

    // Xử lý dữ liệu phòng chat để thêm trường myID, otherID, thông tin doanh nghiệp và tin nhắn cuối cùng
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

        let companyDetails = {};
        let lastMessage = null;
        if (otherID) {
          // Lấy thông tin doanh nghiệp dựa trên otherID
          companyDetails = await companyModel.findOne({ _id: otherID }).select(
            'company_name company_logo'
          );
        }

        if (messages.length > 0) {
          lastMessage = messages[0];
        }

        return {
          _id,
          myID,
          otherID,
          company_name: companyDetails ? companyDetails.company_name : null,
          company_logo: companyDetails ? companyDetails.company_logo : null,
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
        ? 'Lấy danh sách phòng chat thành công!'
        : 'Không tìm thấy phòng chat nào cho người dùng này.',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi: ' + error.message,
    });
  }
};