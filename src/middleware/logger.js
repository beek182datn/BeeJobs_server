const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;
const path = require('path');

const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        myFormat
    ),
    transports: [
        
        new transports.File({ filename: path.join('log', 'error.log'), level: 'error' }), // Chỉ ghi lỗi vào file 'error.log' trong thư mục 'log'
        new transports.File({ filename: path.join('log', 'combined.log') }) // Ghi tất cả các log vào file 'combined.log' trong thư mục 'log'
    ]
});

module.exports = logger;
