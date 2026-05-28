//DO NOT INSTRUMENT

// Libraries

const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

// Errors

const ERROR_PARSING_JSON = require('../error/Constant.error.js').ERROR_PARSING_JSON

// Configurations

const AnalysisLoggerNodeProf = require('../helper/AnalysisLoggerNodeProf.helper')

// Imports

const {
  getStaticAnalysisSummary,
  extractInvocationLocation,
  includesLocation,
  findLocation
} = require('../helper/DynamicAnalyzerNodeProf.helper')

const { revive } = require('../model/Repository.model')
;(function (sandbox) {
  const cliArgs = process.argv.slice(2)
  const servicePath = cliArgs[2]
  const serviceName = servicePath.split(path.sep).pop()
  const staticAnalysisResultPath = cliArgs[cliArgs.length - 1]
  const logger = AnalysisLoggerNodeProf.getLogger(serviceName)

  function loadEnv() {
    process.chdir(servicePath)
    dotenv.config({ path: path.join(servicePath, '.env') })
  }

  function getJsonContent(staticAnalysisResultPath) {
    try {
      const fileData = fs.readFileSync(staticAnalysisResultPath, 'utf8')
      return JSON.parse(fileData)
    } catch (parseErr) {
      logger.error(ERROR_PARSING_JSON, parseErr)
    }
  }

  const staticAnalysisContent = getJsonContent(staticAnalysisResultPath)
  const staticAnalysisRepositories = staticAnalysisContent.map((repositoryJson) =>
    revive(repositoryJson)
  )
  const staticAnalysisSummary = getStaticAnalysisSummary(staticAnalysisRepositories, servicePath)

  loadEnv()

  function DynamicAnalysis() {
    this.invokeFun = function (iid, f, base, args, result, isConstructor, isMethod, functionIid) {
      let invocationData = undefined

      try {
        invocationData = extractInvocationLocation(J$.iidToLocation(iid))
      } catch (e) {
        logger.warning({
          message: 'Unexpected location',
          receivedValue: J$.iidToLocation(iid),
          timestamp: Date.now()
        })
      }

      const filePath = invocationData?.getFilePath()

      if (!invocationData) {
        return { f: f, base: base, args: args, skip: false }
      }

      const invokedFileLocations = staticAnalysisSummary[filePath]

      if (
        invokedFileLocations &&
        includesLocation(invokedFileLocations, invocationData.getFileLocation())
      ) {
        let codeFragmentLocation = findLocation(
          invokedFileLocations,
          invocationData.getFileLocation()
        )

        logger.trace({
          location: codeFragmentLocation.getFilePath(),
          timestamp: Date.now(),
          argumentValues: args
        })
      }

      return { f: f, base: base, args: args, skip: false }
    }
  }

  sandbox.analysis = new DynamicAnalysis()
})(J$)
