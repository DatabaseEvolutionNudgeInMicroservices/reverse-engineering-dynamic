// Libraries

const winston = require('winston')
const path = require('path')

/**
 * Manages the dynamic analyzer logs.
 */
class DynamicAnalyzerLogger {
  /**
   * Creates a logger for the application, saving the logs in the specified directory.
   * @param {string} directory The specified directory to save the logs into ('./logs' by default).
   */
  constructor(directory = 'logs') {
    this.logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(
          ({ timestamp, level, message }) => `[${level.toUpperCase()}] ${message}`
        )
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: path.join(directory, 'info.log'),
          level: 'info'
        }),
        new winston.transports.File({
          filename: path.join(directory, 'warn.log'),
          level: 'warn'
        }),
        new winston.transports.File({
          filename: path.join(directory, 'error.log'),
          level: 'error'
        }),
        new winston.transports.File({
          filename: path.join(directory, 'logs.log')
        })
      ]
    })
  }

  debug(message) {
    this.logger.debug(message)
  }

  info(message) {
    this.logger.info(message)
  }

  warn(message) {
    this.logger.warn(message)
  }

  error(message) {
    this.logger.error(message)
  }
}

module.exports = DynamicAnalyzerLogger
