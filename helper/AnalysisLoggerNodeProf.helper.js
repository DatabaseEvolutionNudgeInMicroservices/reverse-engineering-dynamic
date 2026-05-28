// Libraries

const winston = require('winston')
const jsonStringify = require('fast-safe-stringify')
const path = require('path')

// Constants

const { TEMP_FOLDER_NAME } = require('../helper/Constant.helper.js')

/**
 * Manages the dynamic analysis logs.
 */
class AnalysisLoggerNodeProf {
  static getLogger(fileName = 'traces') {
    return winston.createLogger({
      levels: { trace: 0, error: 1, warning: 2, info: 3, debug: 4 },
      transports: [
        new winston.transports.File({
          level: 'trace',
          format: winston.format.combine(
            winston.format.printf((info) => jsonStringify(info.message))
          ),
          filename: path.join(__dirname, '..', TEMP_FOLDER_NAME, `${fileName}.log`)
        }),
        new winston.transports.File({
          level: 'warning',
          format: winston.format.combine(
            winston.format((info) => (info.level === 'warning' ? info : false))(),
            winston.format.printf((info) => jsonStringify(info))
          ),
          filename: path.join(__dirname, '..', TEMP_FOLDER_NAME, `${fileName}-warnings.log`)
        })
      ]
    })
  }
}

module.exports = AnalysisLoggerNodeProf
