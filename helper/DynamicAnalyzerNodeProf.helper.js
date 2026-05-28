// Libraries

const path = require('path')

// Imports

const DynamicAnalyzer = require('./DynamicAnalyzer.helper.js')
const DynamicAnalyzerLogger = require('./DynamicAnalyzerLogger.helper')

// Errors

const BadFormat = require('../error/BadFormat.error')
const {
  INPUT_INCORRECTLY_FORMATTED,
  LOCATION_INCORRECTLY_FORMATTED,
  GIT_URL_FORMAT_INCORRECTLY_FORMATTED,
  MISSING_EMPTY_REPORT
} = require('../error/Constant.error.js')

// Models

const { revive } = require('../model/Repository.model')
const Call = require('../model/Call.model.js')
const InvocationLocation = require('../model/InvocationLocation.model')
const FileLocation = require('../model/FileLocation.model')
const RepositoryFileLocation = require('../model/RepositoryFileLocation.model')
const TraceLine = require('../model/TraceLine.model')

// Constants

const { MIN_FRAGMENT_SCORE, APPLICATION_LOGS_FOLDER_NAME } = require('./Constant.helper')

/**
 * @overview This class represents the NodeProf dynamic analyzer helper, mapping the traces resulting from the NodeProf analysis to a static analysis report.
 */
class DynamicAnalyzerNodeProf extends DynamicAnalyzer {
  /**
   * Instantiates a NodeProf dynamic analysis helper.
   */
  constructor() {
    super()
    this.logger = new DynamicAnalyzerLogger(APPLICATION_LOGS_FOLDER_NAME)
  }

  /**
   * Extracts the dynamic analysis by traces.
   * @param lines {string[]} The given traces.
   * @returns {Promise} A promise for the extraction.
   */
  extractByTraces(lines) {
    return new Promise((resolveAll, rejectAll) => {
      if (lines && lines.length) {
        const promises = []

        lines.forEach((line) => {
          try {
            promises.push(this.extractByTrace(line))
          } catch (error) {
            rejectAll(error)
          }
        })

        Promise.all(promises)
          .then((resultsAll) => {
            const resultsWithValues = resultsAll.filter((result) => result !== null)
            resolveAll(resultsWithValues)
          })
          .catch((errorAll) => {
            rejectAll(errorAll)
          })
      } else {
        rejectAll(new BadFormat(INPUT_INCORRECTLY_FORMATTED))
      }
    })
  }

  /**
   * Extracts an analysis by trace.
   * @param trace {string} The given trace.
   * @returns {Promise} A promise for the extraction.
   */
  extractByTrace(trace) {
    return new Promise((resolve, reject) => {
      try {
        const jsonTraceLine = JSON.parse(trace)
        resolve(TraceLine.revive(jsonTraceLine))
      } catch (error) {
        if (error instanceof SyntaxError || error instanceof BadFormat) {
          this.logger.warn(`Unexpected element '${trace}'. The line will be ignored.`)
          resolve(null)
        } else {
          reject(error)
        }
      }
    })
  }

  /**
   * Interprets a dynamic analysis by traces to inject the results to the static analysis report.
   * @param staticAnalysisReport {string} The result of the static analysis report.
   * @param traces {TraceLine[]} The dynamic analysis traces.
   * @returns {Promise} A promise for the interpretation.
   */
  interpretByTraces(staticAnalysisReport, traces) {
    return new Promise((resolve, reject) => {
      const repositories = []
      const staticAnalysisResultObject = JSON.parse(staticAnalysisReport)

      staticAnalysisResultObject.forEach((repositoryObject) =>
        repositories.push(revive(repositoryObject))
      )

      if (!repositories || !repositories.length) {
        reject(new BadFormat(MISSING_EMPTY_REPORT))
      }

      if (traces) {
        repositories.forEach((repository) => {
          repository.getDirectories().forEach((directory) => {
            this.interpretByTracesDirectories(directory, traces)
          })
        })

        resolve(repositories)
      } else {
        reject(new BadFormat(INPUT_INCORRECTLY_FORMATTED))
      }
    })
  }

  interpretByTracesDirectories(directory, traces) {
    traces.forEach((traceLine) => {
      directory.getFiles().forEach((file) => {
        const matchingFragments = file
          .getCodeFragments()
          .filter((fragment) => fragment.getLocation() === traceLine.getLocation())

        if (matchingFragments.length) {
          const highestScoreFragment = matchingFragments.reduce(
            (maxScoreFragment, currentFragment) =>
              currentFragment.getScore() > maxScoreFragment.getScore()
                ? currentFragment
                : maxScoreFragment
          )
          highestScoreFragment.addCall(
            new Call(traceLine.getTimestamp(), traceLine.getArgumentValues())
          )
        }
      })
    })

    directory.getDirectories().forEach((subDirectory) => {
      this.interpretByTracesDirectories(subDirectory, traces)
    })
  }

  /*******************************************************************************************************************
   ****************************************************** UTILS ******************************************************
   ******************************************************************************************************************/

  /**
   * Extracts the location data from an invocation, based on the local path location.
   * @param localPathLocation {string} The location of the invocation in the local file, including the path, the lines and the columns.
   * @returns {InvocationLocation} The location data extracted from the local path location string.
   */
  static extractInvocationLocation(localPathLocation) {
    const regex = /.*?((?:[a-zA-Z]:[\\/])?[^:()]+):(\d+):(\d+):(\d+):(\d+)\).*/ // Should match Windows and Unix paths.
    const match = localPathLocation.match(regex)

    if (!match) {
      throw new BadFormat(`${INPUT_INCORRECTLY_FORMATTED}: ${LOCATION_INCORRECTLY_FORMATTED}`)
    }

    return new InvocationLocation(
      match[1],
      new FileLocation(
        parseInt(match[2]),
        parseInt(match[4]),
        parseInt(match[3]),
        parseInt(match[5])
      )
    )
  }

  /**
   * Extracts the location data from a code fragment location string, as formatted in the static analysis result.
   * The location string is formatted as #LX1CY1-LX2CY2, where X1, Y1, X2 and Y2 are line and column numbers.
   * @param location {string} The location string of a code fragment.
   * @returns {FileLocation} The location data, containing the start and end line and column numbers.
   */
  static extractCodeFragmentLocation(location) {
    const codeFragmentPart = location.split('#')[1]
    const regex = /L(\d+)C(\d+)-L(\d+)C(\d+)/
    const match = codeFragmentPart.match(regex)

    if (!match) {
      throw new BadFormat(`${INPUT_INCORRECTLY_FORMATTED}: ${LOCATION_INCORRECTLY_FORMATTED}`)
    }

    return new FileLocation(
      parseInt(match[1]),
      parseInt(match[3]),
      parseInt(match[2]),
      parseInt(match[4])
    )
  }

  /**
   * Extracts the location data from a Git repository URL.
   * @param {string} url The Git repository URL.
   * @returns {object|null} The extracted repository information.
   */
  static extractFromUrl(url) {
    const regex = /https:\/\/[^\/]+\/([^\/]+)\/([^\/]+)\/(?:tree)\/[a-f0-9]+\/(.+)/ // Capture the owner, the repository name and the relative path.
    const match = url.match(regex)

    if (!match)
      throw new BadFormat(`${INPUT_INCORRECTLY_FORMATTED}: ${GIT_URL_FORMAT_INCORRECTLY_FORMATTED}`)

    return {
      owner: match[1],
      repository: match[2],
      relativeFilePath: match[3]
    }
  }

  /**
   * Extracts the project path by identifying the repository in the file system path.
   * @param {string} servicePath The path to the running service.
   * @param {string} repositoryName The repository name from Git URL.
   * @returns {string|null} The root path or null if not found.
   */
  static extractFromPath(servicePath, repositoryName) {
    const normalizedPath = servicePath.replace(/\\/g, '/')
    const repositoryNameRegex = new RegExp(`(.*?/${repositoryName})/`)
    const match = normalizedPath.match(repositoryNameRegex)
    return match ? match[1] : null
  }

  /**
   * Maps the path from Git URL path to the file system path or vice versa.
   * @param {string} servicePath The path to the service directory.
   * @param {object} urlElements The elements extracted from GitHub URL.
   * @returns {string|null} The file system path corresponding to Git URL path or vice versa.
   */
  static mapPath(servicePath, urlElements) {
    if (!urlElements) return null

    const { repository, relativeFilePath } = urlElements
    const projectPath = DynamicAnalyzerNodeProf.extractFromPath(servicePath, repository)

    if (!projectPath) {
      return path.join(servicePath, relativeFilePath)
    }

    return path.join(projectPath, relativeFilePath)
  }

  /**
   * Tells if the given values object contains the given location data.
   * The column values are compared with a tolerance of 1.
   * @param repositoryFileLocations {RepositoryFileLocation[]} The collection of repositories file location to search in.
   * @param targetLocationData {FileLocation} The invocation data containing the location to compare with the values object.
   * @returns true if the values object includes the location data, false otherwise.
   */
  static includesLocation(repositoryFileLocations, targetLocationData) {
    return repositoryFileLocations.some((value) => {
      const fileLocation = value.getFileLocation()
      return (
        fileLocation.getStartLineNumber() === targetLocationData.getStartLineNumber() &&
        DynamicAnalyzerNodeProf.compareWithTolerance(
          fileLocation.getStartColumnNumber(),
          targetLocationData.getStartColumnNumber(),
          1
        ) &&
        fileLocation.getEndLineNumber() === targetLocationData.getEndLineNumber() &&
        DynamicAnalyzerNodeProf.compareWithTolerance(
          fileLocation.getEndColumnNumber(),
          targetLocationData.getEndColumnNumber(),
          1
        )
      )
    })
  }

  /**
   * Finds a repository file location in the given collection, based on a given file location data.
   * The columns are compared with a tolerance of 1.
   * @param repositoryFileLocations {RepositoryFileLocation[]} The collection of repositories file location to search in.
   * @param targetLocationData {FileLocation} The invocation data containing the location to compare with the values object.
   * @returns {RepositoryFileLocation}
   */
  static findLocation(repositoryFileLocations, targetLocationData) {
    return repositoryFileLocations.find((value) => {
      const fileLocation = value.getFileLocation()
      return (
        fileLocation.getStartLineNumber() === targetLocationData.getStartLineNumber() &&
        DynamicAnalyzerNodeProf.compareWithTolerance(
          fileLocation.getStartColumnNumber(),
          targetLocationData.getStartColumnNumber(),
          1
        ) &&
        fileLocation.getEndLineNumber() === targetLocationData.getEndLineNumber() &&
        DynamicAnalyzerNodeProf.compareWithTolerance(
          fileLocation.getEndColumnNumber(),
          targetLocationData.getEndColumnNumber(),
          1
        )
      )
    })
  }

  /**
   * Provides a dictionary containing the repository location data for every local file of the given project.
   * This format allows to quickly get the important static analysis data for a file when a function/method invocation occurs.
   * For instance, it is used to check whether a function invocation should be record in the trace or not.
   * Since the invocation occurs in a local file, the repository location is not sufficient.
   * Thus, the dictionary is using the local file location as key, resulting from a mapping.
   * @param staticAnalysisReport {Repository[]} The repository object containing the static analysis report.
   * @param projectPath {string} The path to the project.
   * @returns A dictionary containing the data for every local file mentioned in the analysis.
   */
  static getStaticAnalysisSummary(staticAnalysisReport, projectPath) {
    const dictionary = {}

    if (!staticAnalysisReport || !Array.isArray(staticAnalysisReport)) {
      return dictionary
    }

    staticAnalysisReport.forEach((repository) => {
      repository.getDirectories().forEach((directory) => {
        DynamicAnalyzerNodeProf.getStaticAnalysisSummaryDirectory(
          directory,
          dictionary,
          projectPath
        )
      })
    })

    return dictionary
  }

  static getStaticAnalysisSummaryDirectory(directory, dictionary, projectPath) {
    directory.getFiles().forEach((file) => {
      const urlElements = DynamicAnalyzerNodeProf.extractFromUrl(file.getLocation())

      if (urlElements) {
        const localFileLocation = DynamicAnalyzerNodeProf.mapPath(projectPath, urlElements)
        dictionary[localFileLocation] = dictionary[localFileLocation] || []

        file.getCodeFragments().forEach((fragment) => {
          const fileLocationData = DynamicAnalyzerNodeProf.extractCodeFragmentLocation(
            fragment.getLocation()
          )
          if (
            fileLocationData.getEndLineNumber() !== 0 &&
            fragment.getScore() >= MIN_FRAGMENT_SCORE &&
            !DynamicAnalyzerNodeProf.includesLocation(
              dictionary[localFileLocation],
              fileLocationData
            )
          ) {
            dictionary[localFileLocation].push(
              new RepositoryFileLocation(fragment.getLocation(), fileLocationData)
            )
          }
        })
      }
    })

    directory.getDirectories().forEach((subDirectory) => {
      DynamicAnalyzerNodeProf.getStaticAnalysisSummaryDirectory(
        subDirectory,
        dictionary,
        projectPath
      )
    })
  }

  /**
   * Compares two numbers with a given tolerance.
   * @param x {number} The first number.
   * @param y {number} The second number.
   * @param tolerance {number} The tolerance to use for the comparison.
   * @returns {boolean} true if the numbers are equal within the tolerance, false otherwise.
   */
  static compareWithTolerance(x, y, tolerance) {
    return Math.abs(x - y) <= tolerance
  }
}

module.exports = DynamicAnalyzerNodeProf
