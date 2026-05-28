/**
 * @overview This class represents a helper for the dynamic analysis, mapping the traces to a static analysis report.
 */
class DynamicAnalyzer {
  /**
   * Instantiates a dynamic analyzer.
   */
  constructor() {}

  /**
   * Extracts an analysis by traces.
   * @param traces {string[]} The given traces.
   * @returns {Promise} A promise for the extraction.
   */
  extractByTraces(traces) {}

  /**
   * Extracts an analysis by trace.
   * @param trace {string} The given trace.
   * @returns {Promise} A promise for the extraction.
   */
  extractByTrace(trace) {}

  /**
   * Interprets a dynamic analysis by traces to inject the results to the static analysis report.
   * @param staticAnalysisReport {string} The result of the static analysis report.
   * @param traces {TraceLine[]} The dynamic analysis traces.
   * @returns {Promise} A promise for the interpretation.
   */
  interpretByTraces(staticAnalysisReport, traces) {}
}

module.exports = DynamicAnalyzer
