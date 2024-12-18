import { createLogger, format, transports } from 'winston';
import pkg from 'winston-daily-rotate-file';

const DailyRotateFile = pkg.default || pkg;

// Custom format to support multiple arguments gracefully
const customFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ level, message, timestamp, ...meta }) => {
    let metaString = '';

    // Capture any additional arguments passed to the logger
    if (meta[Symbol.for('splat')]) {
      metaString = meta[Symbol.for('splat')]
        .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : arg))
        .join(' ');
    }

    return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaString}`.trim();
  })
);

// Create the logger
const logger = createLogger({
  level: 'info',
  format: format.combine(format.splat(), customFormat),
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

    // Daily rotating file for errors
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

