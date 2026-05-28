/**
 * @overview This class represents a repository file location towards a code fragment within a Git repository
 */
class RepositoryFileLocation {
  /**
   * Instantiates a repository file location.
   * @param gitFilePath {string} The location path within the Git repository.
   * @param fileLocation {FileLocation} The line number where the invocation starts.
   */
  constructor(gitFilePath, fileLocation) {
    this.gitFilePath = gitFilePath
    this.fileLocation = fileLocation
  }

  getFilePath() {
    return this.gitFilePath
  }

  getFileLocation() {
    return this.fileLocation
  }

  toString() {
    return JSON.stringify(this)
  }
}

module.exports = RepositoryFileLocation
