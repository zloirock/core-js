'use strict';
// The browser leg of tests/e2e-libs: the shared configuration - browsers, launcher, IE11 where there
// is one, timeouts - plus the files the driver loads into its iframes, which karma has to SERVE but
// must not include, and a reporter that writes every cell's result per browser to the file the runner
// names. One session runs every cell, so the session's exit code cannot say which cell failed, and
// karma's text output reports a test failure and a load error in two different shapes.
const { writeFileSync } = require('node:fs');
const base = require('./karma.conf.js');

// served after the included files: karma includes a file matched twice as its FIRST pattern says
const SERVED = ['../../tests/e2e-libs/artifacts/**/*', '../../tests/e2e-libs/harness/*'];

function resultsReporter(file) {
  function E2ELibsResults(baseReporterDecorator) {
    baseReporterDecorator(this);
    // the console reporter speaks for the run; this one only records it
    this.adapters = [];
    const results = [];
    const errors = [];
    this.onSpecComplete = (browser, result) => {
      results.push({ browser: browser.name, label: result.description, success: result.success, log: result.log });
    };
    this.onBrowserError = (browser, error) => {
      errors.push({ browser: browser.name, error: String(error?.message ?? error) });
    };
    this.onRunComplete = browsers => {
      // synchronous on purpose: karma calls this synchronously and may exit right after it returns
      // eslint-disable-next-line node/no-sync -- see above
      writeFileSync(file, `${ JSON.stringify({ browsers: browsers.map(browser => browser.name), results, errors }, null, 1) }\n`);
    };
  }
  E2ELibsResults.$inject = ['baseReporterDecorator'];
  return E2ELibsResults;
}

module.exports = config => {
  base(config);
  const file = process.env.E2E_LIBS_BROWSER_RESULTS;
  if (!file) throw new Error('E2E_LIBS_BROWSER_RESULTS names no file - start this leg through tests/karma/e2e-libs.mjs');
  config.set({
    files: [...config.files, ...SERVED.map(pattern => ({ pattern, included: false, served: true, watched: false }))],
    plugins: [...config.plugins, { 'reporter:e2e-libs-results': ['type', resultsReporter(file)] }],
    // `dots` rather than `progress`: the latter redraws its line, and in a CI log every redraw stays
    reporters: ['dots', 'e2e-libs-results'],
  });
};
