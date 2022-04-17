const { createLogger, format, transports } = require('winston');
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
    ),
    transports: [
        new transports.DailyRotateFile({
            filename: './logs/log',
            datePattern: 'DD-MM-yyyy'
        })
    ]
});

logger.add(new transports.Console({
    format: format.combine(
        format.colorize(),
        format.simple()
    )
}));

module.exports = {
    logger: logger
};