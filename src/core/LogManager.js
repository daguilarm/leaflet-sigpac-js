/** 
 * Log levels ordered by severity 
 */
const LOG_LEVELS = ['debug', 'info', 'warn', 'error'];

/**
 * Configurable logger with severity filtering
 */
export default class Logger {

  constructor(debug = false) {
    this.currentLevel = debug ? 'debug' : 'warn';
  }

  /**
   * Set minimum log level
   */
  setLogLevel(level) {
    if (LOG_LEVELS.includes(level)) {
      this.currentLevel = level;
    }
  }

  /**
   * Log debug message
   */
  debug(message, data = null) {
    this.#log('debug', message, data);
  }

  /**
   * Log info message
   */
  info(message, data = null) {
    this.#log('info', message, data);
  }

  /**
   * Log warning message
   */
  warn(message, data = null) {
    this.#log('warn', message, data);
  }

  /**
   * Log error message
   */
  error(message, error = null) {
    this.#log('error', message, error);
  }

  /**
   * Internal log handler
   * @private
   */
  #log(level, message, data) {
    if (this.#shouldLog(level)) {
      const logFn = console[level] || console.log;
      const prefix = `[SIGPAC-${level.toUpperCase()}]`;
      
      if (data) {
        logFn(`${prefix} ${message}`, data);
      } else {
        logFn(`${prefix} ${message}`);
      }
    }
  }

  /**
   * Determine if message should be logged
   * @private
   */
  #shouldLog(level) {
    return LOG_LEVELS.indexOf(level) >= LOG_LEVELS.indexOf(this.currentLevel);
  }
}