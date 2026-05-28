// Libraries

const dotenv = require('dotenv')

/**
 * @overview Represents the helper constants.
 */

// Configuration

dotenv.config()

// Constants

const APPLICATION_LOGS_FOLDER_NAME = 'logs'
const TEMP_FOLDER_NAME = 'TEMP'
const OUTPUT_FOLDER_NAME = 'output'
const NODEPROF_PATH = 'lib/workspace-nodeprof/nodeprof.js'
const MIN_FRAGMENT_SCORE = 2

module.exports = {
  APPLICATION_LOGS_FOLDER_NAME,
  TEMP_FOLDER_NAME,
  OUTPUT_FOLDER_NAME,
  NODEPROF_PATH,
  MIN_FRAGMENT_SCORE
}
