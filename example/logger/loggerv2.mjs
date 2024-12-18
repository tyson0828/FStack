import { createLogger, format, transports } from 'winston';
import pkg from 'winston-daily-rotate-file';

const DailyRotateFile = pkg.default || pkg;

// Custom format to handle multiple arguments
const customFormat = format.printf(({ level, message, timestamp, ...meta }) => {
  const metaString = meta[Symbol.for('splat')] ? meta[Symbol.for('splat')].join(' ') : '';
  return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaString}`;
});

// Logger configuration
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.splat(), // Allows multiple arguments
    customFormat
  ),
  transports: [
    // Console transport
    new transports.Console(),

    // Daily rotating file for all logs
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),

    // Daily rotating file for error logs
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});

export default logger;

