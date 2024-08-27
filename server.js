var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();
require('./src/middleware/cron');
const bodyParser = require("body-parser");
const configViewEngine = require("./src/config/viewEngine");
const initWebRouter = require("./src/routes/All_Router");
const http = require('http');
const socketIo = require('socket.io');
const headerUserInfo = require("./src/middleware/headerUserInfo");
const GetNotifi = require("./src/middleware/GetNotifi");
const NotificationHelper = require("./src/helper/NotificationHelper");
const firebase = require('./src/firebase/index');
var app = express();
configViewEngine(app);

// Create HTTP server
const server = http.createServer(app);
const io = socketIo(server);
NotificationHelper.setIo(io);
// Socket.IO configuration
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  socket.on('leaveRoom', (roomId) => {
    socket.leave(roomId);
    console.log(`User left room: ${roomId}`);
  });

  socket.on('newMessage', (message) => {
    io.to(message.chatRoomId).emit('message', message);
    console.log('New message:', message);
  });

  socket.on('newNotification', (notification) => {
    io.to(notification.userId).emit('notification', notification);
    console.log('New notification:', notification);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

app.set('io', io);

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(headerUserInfo);
app.use(GetNotifi);
// Error handling
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);

  if (req.originalUrl.indexOf("/api") === 0) {
    res.json({
      status: 0,
      msg: err.message,
    });
  } else {
    res.render("error");
  }
});

// Initialize routes
initWebRouter(app);

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, (err) => {
  if (err) {
    console.error("Cannot start server:", err);
    return;
  }
  console.log(">>> Server listening on port " + PORT);
});
