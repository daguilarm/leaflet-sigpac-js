/**
 * A simple logger class to handle conditional logging based on severity levels.
 * It prefixes messages to distinguish them in the console.
 */
export default class Logger {
  
  //The available logging levels, ordered by severity.
  static #logLevels = ['debug', 'info', 'warn', 'error'];

  //The current logging level. Only messages with this level or higher will be displayed.
  currentLevel;

  //Creates an instance of the Logger.
  constructor(debug = false) {
    this.currentLevel = debug ? 'debug' : 'warn';
  }
  
  //Sets the current logging level.
  setLogLevel(level) {
    if (Logger.#logLevels.includes(level)) {
      this.currentLevel = level;
    }
  }
  
  //Logs a debug message if the current log level allows it.
  debug(message, data = null) {
    if (this.#shouldLog('debug')) {
      console.debug(`[SIGPAC-DEBUG] ${message}`, data);
    }
  }
  
  //Logs an info message if the current log level allows it.
  info(message, data = null) {
    if (this.#shouldLog('info')) {
      console.info(`[SIGPAC-INFO] ${message}`, data);
    }
  }
  
  //Logs a warning message if the current log level allows it.
  warn(message, data = null) {
    if (this.#shouldLog('warn')) {
      console.warn(`[SIGPAC-WARN] ${message}`, data);
    }
  }
  
  //Logs an error message if the current log level allows it.
  error(message, error = null) {
    if (this.#shouldLog('error')) {
      console.error(`[SIGPAC-ERROR] ${message}`, error);
    }
  }
  
  //Determines if a message of a given level should be logged based on the current log level.
  #shouldLog(level) {
    const levelIndex = Logger.#logLevels.indexOf(level);
    const currentIndex = Logger.#logLevels.indexOf(this.currentLevel);
    return levelIndex >= currentIndex;
  }
}