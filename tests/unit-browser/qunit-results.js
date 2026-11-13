'use strict';
// published by the page, since callbacks added after the navigation miss a finished run
(function () {
  var QUnit = window.QUnit;
  // the list travels in one WebDriver response
  var LIMIT = 50;
  // a big collection dumps into megabytes
  var VALUE_LIMIT = 1000;
  // QUnit 1 calls done again for a global error after the run
  var SETTLE_TIME = 1000;
  var settle;
  var results = { done: false, failures: [] };

  function dump(value) {
    var text = QUnit.dump.parse(value);
    if (typeof text !== 'string') text = String(value);
    return text.length > VALUE_LIMIT ? text.slice(0, VALUE_LIMIT) + '...' : text;
  }

  QUnit.log(function (details) {
    if (details.result || results.failures.length === LIMIT) return;
    var failure = { module: details.module, test: details.name, message: details.message || '' };
    if ('expected' in details) {
      failure.actual = dump(details.actual);
      failure.expected = dump(details.expected);
    }
    results.failures.push(failure);
  });

  QUnit.testStart(function (details) {
    results.currentTest = { module: details.module, test: details.name };
  });

  QUnit.testDone(function () {
    results.currentTest = null;
  });

  QUnit.done(function (details) {
    results.failed = details.failed;
    results.total = details.total;
    clearTimeout(settle);
    settle = setTimeout(function () {
      results.done = true;
    }, SETTLE_TIME);
  });

  // published last, so a page without QUnit has no reporter
  window.qunitResults = results;
})();
