// Libraries

const fs = require('fs')
const path = require('path')

// Imports

const DynamicAnalyzerNodeProf = require('./helper/DynamicAnalyzerNodeProf.helper')
const DynamicAnalyzerLogger = require('./helper/DynamicAnalyzerLogger.helper')

// Constants

const { OUTPUT_FOLDER_NAME, APPLICATION_LOGS_FOLDER_NAME } = require('./helper/Constant.helper')

// Configuration : Logger

const logger = new DynamicAnalyzerLogger(APPLICATION_LOGS_FOLDER_NAME)

// Configuration : Static Analysis

const staticAnalysisReportPath = process.argv[2]
const tracesFilePaths = process.argv.slice(3)
const tracesLines = []
const staticAnalysisReportContent = fs.readFileSync(staticAnalysisReportPath, 'utf8')
tracesFilePaths.forEach((tracesFilePath) => {
  const tracesFileLines = fs.readFileSync(tracesFilePath, 'utf-8').split('\n')
  tracesLines.push(...tracesFileLines)
})

// Configuration : Dynamic Analysis

const dynamicAnalyzerNodeProf = new DynamicAnalyzerNodeProf()

const timestamp = Date.now()

try {
  if (!fs.existsSync(OUTPUT_FOLDER_NAME)) {
    fs.mkdirSync(OUTPUT_FOLDER_NAME)
  }
} catch (err) {
  logger.error(err)
}

dynamicAnalyzerNodeProf
  .extractByTraces(tracesLines)
  .then((tracesLines) => {
    dynamicAnalyzerNodeProf
      .interpretByTraces(staticAnalysisReportContent, tracesLines)
      .then((dynamicAnalysisReportContent) => {
        const fileName = `result_${timestamp}.json`
        fs.writeFileSync(
          path.join(process.cwd(), OUTPUT_FOLDER_NAME, fileName),
          JSON.stringify(dynamicAnalysisReportContent)
        )
        logger.info(`Report '${fileName}' successfully saved in the '${OUTPUT_FOLDER_NAME}' folder`)
      })
      .catch((error) => logger.error(error))
  })
  .catch((error) => logger.error(error))
