const { createLogger, format, transports } = require('winston');
const { logs } = require('../config.json');
require('winston-daily-rotate-file');

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    )
});

logger.add(new transports.Console({
    format: format.combine(
        format.colorize(),
        format.simple()
    )
}));

if (logs.toFile) {
    logger.add(new transports.DailyRotateFile({
        filename: './logs/log',
        datePattern: 'DD-MM-yyyy'
    }));
}

module.exports = {
    logger: logger
};
