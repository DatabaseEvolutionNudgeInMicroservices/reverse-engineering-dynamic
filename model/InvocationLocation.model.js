/**
 * @overview This class represents the invocation location within a file occurring at runtime.
 */
class InvocationLocation {
  /**
   * Instantiates an invocation location.
   * @param filePath {string} The location path.
   * @param fileLocation {FileLocation} The line number where the invocation starts.
   */
  constructor(filePath, fileLocation) {
    this.filePath = filePath
    this.fileLocation = fileLocation
  }

  getFilePath() {
    return this.filePath
  }

  getFileLocation() {
    return this.fileLocation
  }

  toString() {
    return JSON.stringify(this)
  }
}

module.exports = InvocationLocation
