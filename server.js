// Tệp app.js hoặc tệp server chính

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();
var apiRouter = require('./src/routes/api');
var webAdminRouter = require('./src/routes/webAdmin');
const bodyParser = require('body-parser');
const configViewEngine = require('./src/config/viewEngine');
const initWebRouter = require('./src/routes/webAdmin');

var app = express();
configViewEngine(app);

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

// Cài đặt middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Định tuyến API
app.use('/api', apiRouter);


// Xử lý lỗi
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);

  if (req.originalUrl.indexOf('/api') === 0) {
    // truy cập vào link API
    res.json({
      status: 0,
      msg: err.message
    });
  } else {
    res.render('error');
  }
});
initWebRouter(app);
const PORT = process.env.PORT || 3000;
app.listen(PORT, (err) => {
  if (err) {
    console.error("Không thể khởi động server:", err);
    return;
  }
  console.log(">>> Server đang lắng nghe trên cổng " + PORT);
});
