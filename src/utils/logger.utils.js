import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFilePath = path.join(logsDir, 'cron-jobs.log');

/**
 * Format log message with timestamp
 */
const formatLogMessage = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  let logMessage = `[${timestamp}] [${level}] ${message}`;
  
  if (data) {
    if (typeof data === 'object') {
      logMessage += ` ${JSON.stringify(data, null, 2)}`;
    } else {
      logMessage += ` ${data}`;
    }
  }
  
  return logMessage + '\n';
};

/**
 * Write log to file
 */
const writeLog = (level, message, data = null) => {
  const logMessage = formatLogMessage(level, message, data);
  
  // Also log to console for real-time monitoring
  if (level === 'ERROR') {
    console.error(logMessage.trim());
  } else {
    console.log(logMessage.trim());
  }
  
  // Append to log file
  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error('Failed to write to log file:', err);
    }
  });
};

/**
 * Logger utility object
 */
const logger = {
  info: (message, data = null) => writeLog('INFO', message, data),
  error: (message, data = null) => writeLog('ERROR', message, data),
  warn: (message, data = null) => writeLog('WARN', message, data),
  debug: (message, data = null) => writeLog('DEBUG', message, data),
};

export default logger;
