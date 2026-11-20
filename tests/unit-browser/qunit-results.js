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
  var parse = QUnit.dump.parse;

  // QUnit's HTML reporter dumps the values before our log callback runs.
  QUnit.dump.parse = function (value, type, stack) {
    var depth = this.depth;
    try {
      var text = parse.call(this, value, type, stack);
      return typeof text === 'string' ? text : String(value);
    } catch (error) {
      // Unwind the recursive dump before restoring its indentation depth.
      if (stack) throw error;
      this.depth = depth;
      return '[unprintable]';
    }
  };

  function dump(value) {
    var text = QUnit.dump.parse(value);
    return text.length > VALUE_LIMIT ? text.slice(0, VALUE_LIMIT) + '...' : text;
  }

  function resetDone() {
    if (settle) clearTimeout(settle);
    results.done = false;
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
    resetDone();
    results.currentTest = { module: details.module, test: details.name };
  });

  QUnit.testDone(function () {
    results.currentTest = null;
  });

  QUnit.done(function (details) {
    resetDone();
    results.failed = details.failed;
    results.total = details.total;
    settle = setTimeout(function () {
      results.done = true;
    }, SETTLE_TIME);
  });

  // published last, so a page without QUnit has no reporter
  window.qunitResults = results;
})();
