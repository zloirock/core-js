'use strict';
// the outcome of the page for a WebDriver client to poll: the markup of the HTML reporter is not an
// interface, and callbacks registered by the client after the navigation miss a run that already ended
(function () {
  var QUnit = window.QUnit;
  // a polyfill broken at the root fails thousands of assertions, and the list travels in one response
  var LIMIT = 50;
  // the dump of a big collection runs into megabytes, and it is read in a log line
  var VALUE_LIMIT = 1000;
  // QUnit 1 reports a global error after the run as one more test and calls done again within milliseconds
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
    // an error outside an assertion compares nothing
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

  // published last: without QUnit to attach to, the page has no reporter rather than a run that never ends
  window.qunitResults = results;
})();
