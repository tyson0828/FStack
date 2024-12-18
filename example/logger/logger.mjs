import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf } = format;

// Dynamically import winston-daily-rotate-file
const { default: DailyRotateFile } = await import('winston-daily-rotate-file');

// Define log format
const logFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

// Create logger instance
const logger = createLogger({
  level: 'info', // Default log level
  format: logFormat,
  transports: [
    // Console transport
    new transports.Console(),

    // Daily rotating files for all logs
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true, // Compress old log files
      maxSize: '20m', // Max size before rotation
      maxFiles: '14d' // Keep files for 14 days
    }),

    // Daily rotating files for error logs
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});

export default logger;

