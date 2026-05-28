/**
 * @overview This class represents a file location.
 */
class FileLocation {
  /**
   * Constructor for the file location.
   * @param startLineNumber {number} The line number where the invocation starts.
   * @param endLineNumber {number} The line number where the invocation ends.
   * @param startColumnNumber {number} The column number where the invocation starts.
   * @param endColumnNumber {number} The column number where the invocation ends.
   */
  constructor(startLineNumber, endLineNumber, startColumnNumber, endColumnNumber) {
    this.startLineNumber = startLineNumber
    this.endLineNumber = endLineNumber
    this.startColumnNumber = startColumnNumber
    this.endColumnNumber = endColumnNumber
  }

  getStartLineNumber() {
    return this.startLineNumber
  }

  getEndLineNumber() {
    return this.endLineNumber
  }

  getStartColumnNumber() {
    return this.startColumnNumber
  }

  getEndColumnNumber() {
    return this.endColumnNumber
  }

  toString() {
    return JSON.stringify(this)
  }
}

module.exports = FileLocation
