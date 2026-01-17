import api from './api';

const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
};

const logQueue = [];
let flushTimeout = null;
const FLUSH_INTERVAL = 5000;
const MAX_QUEUE_SIZE = 10;

const sendLog = async (level, message, extra = {}) => {
  const logEntry = {
    level,
    message: typeof message === 'object' ? JSON.stringify(message) : String(message),
    source: extra.source || 'frontend',
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
  };

  logQueue.push(logEntry);

  if (logQueue.length >= MAX_QUEUE_SIZE) {
    flushLogs();
  } else if (!flushTimeout) {
    flushTimeout = setTimeout(flushLogs, FLUSH_INTERVAL);
  }
};

const flushLogs = async () => {
  if (flushTimeout) {
    clearTimeout(flushTimeout);
    flushTimeout = null;
  }

  if (logQueue.length === 0) return;

  const logsToSend = [...logQueue];
  logQueue.length = 0;

  try {
    await api.post('/logs/batch', logsToSend);
  } catch (err) {
    // Fallback to console if logging endpoint fails
    logsToSend.forEach(log => {
      console.warn('[Logger fallback]', log.level, log.message);
    });
  }
};

// Flush logs before page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', flushLogs);
}

const logger = {
  debug: (message, extra) => sendLog(LOG_LEVELS.DEBUG, message, extra),
  info: (message, extra) => sendLog(LOG_LEVELS.INFO, message, extra),
  warn: (message, extra) => sendLog(LOG_LEVELS.WARN, message, extra),
  error: (message, extra) => sendLog(LOG_LEVELS.ERROR, message, extra),
  flush: flushLogs,
};

export default logger;