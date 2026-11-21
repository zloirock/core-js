'use strict';
// The browser leg of tests/e2e-libs: the shared configuration - browsers, launcher, IE11 where there
// is one, timeouts - plus the files the driver loads into its iframes, which karma has to SERVE but
// must not include, and a reporter that writes every cell's result per browser to the file the runner
// names. One session runs every cell, so the session's exit code cannot say which cell failed, and
// karma's text output reports a test failure and a load error in two different shapes.
const { renameSync, writeFileSync } = require('node:fs');
const base = require('./karma.conf.js');

// served after the included files: karma includes a file matched twice as its FIRST pattern says
const SERVED = ['../../tests/e2e-libs/artifacts/**/*', '../../tests/e2e-libs/harness/*'];

function resultsReporter(save) {
  function E2ELibsResults(baseReporterDecorator) {
    baseReporterDecorator(this);
    // the console reporter speaks for the run; this one only records it
    this.adapters = [];
    const results = new Map();
    const errors = new Map();
    function checkpoint() {
      save({
        browsers: [], // a partial report can gate retries, never declare a successful run
        results: results.values().toArray().flat().filter(result => !result.success || result.skipped),
        errors: errors.values().toArray().flat(),
      });
    }
    this.onBrowserStart = browser => {
      const retry = results.has(browser.id);
      results.set(browser.id, []);
      errors.delete(browser.id);
      if (retry) checkpoint();
    };
    this.onSpecComplete = (browser, result) => {
      results.get(browser.id).push({
        browser: browser.name, label: result.description, success: result.success, skipped: result.skipped, log: result.log,
      });
      if (!result.success || result.skipped) checkpoint();
    };
    this.onBrowserError = (browser, error) => {
      if (!errors.has(browser.id)) errors.set(browser.id, []);
      errors.get(browser.id).push({ browser: browser.name, error: String(error?.message ?? error) });
      checkpoint();
    };
    this.onRunComplete = browsers => save({
      browsers: browsers.map(browser => browser.name),
      results: results.values().toArray().flat(),
      errors: errors.values().toArray().flat(),
    });
  }
  E2ELibsResults.$inject = ['baseReporterDecorator'];
  return E2ELibsResults;
}

// Karma may exit during a checkpoint. Readers must see either complete report.
function saveReport(file, report) {
  const pending = `${ file }.tmp`;
  /* eslint-disable node/no-sync -- publish the checkpoint before the next reporter runs */
  writeFileSync(pending, `${ JSON.stringify(report, null, 1) }\n`);
  renameSync(pending, file);
  /* eslint-enable node/no-sync -- checkpoint published */
}

module.exports = config => {
  base(config);
  const file = process.env.E2E_LIBS_BROWSER_RESULTS;
  if (!file) throw new Error('E2E_LIBS_BROWSER_RESULTS names no file - start this leg through tests/karma/e2e-libs.mjs');
  config.set({
    failOnFailingTestSuite: false, // explicit test failures are gated by the runner
    failOnSkippedTests: true,
    files: [...config.files, ...SERVED.map(pattern => ({ pattern, included: false, served: true, watched: false }))],
    plugins: [...config.plugins, { 'reporter:e2e-libs-results': ['type', resultsReporter(report => saveReport(file, report))] }],
    // `dots` rather than `progress`: the latter redraws its line, and in a CI log every redraw stays
    reporters: ['e2e-libs-results', 'dots'],
  });
};

module.exports.resultsReporter = resultsReporter;
module.exports.saveReport = saveReport;
