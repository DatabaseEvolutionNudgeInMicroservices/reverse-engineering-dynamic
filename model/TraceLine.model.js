// Error

const BadFormat = require('../error/BadFormat.error')
const { INPUT_INCORRECTLY_FORMATTED } = require('../error/Constant.error')

/**
 * @overview This class represents a logging trace line.
 */
class TraceLine {
  /**
   * Instantiates a trace line.
   */
  constructor(location, timestamp, argumentValues) {
    this.location = location
    this.timestamp = timestamp
    if (argumentValues) {
      // Avoids defining an argumentValues property as undefined (no argumentValues property)
      this.argumentValues = argumentValues
    }
  }

  getTimestamp() {
    return this.timestamp
  }

  getArgumentValues() {
    return this.argumentValues
  }

  getLocation() {
    return this.location
  }

  /**
   * Revives a TraceLin e object.
   * @param object {Object} The given JavaScript object.
   * @return {Technology} The related Technology object.
   * @throws {Error} In the case of an invalid object format.
   */
  static revive(object) {
    if (
      object &&
      // Mandatory fields.
      object.hasOwnProperty('location') &&
      object.hasOwnProperty('timestamp') &&
      object.timestamp
    ) {
      return new TraceLine(object.location, object.timestamp, object?.argumentValues)
    } else {
      throw new BadFormat(`${INPUT_INCORRECTLY_FORMATTED}`)
    }
  }

  /**
   * Prints the object in a human-readable way (JSON).
   */
  toString() {
    return JSON.stringify(this)
  }
}

module.exports = TraceLine
