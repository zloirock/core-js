'use strict';
// the outcome of the page for a WebDriver client to poll: the markup of the HTML reporter is not an
// interface, and callbacks registered by the client after the navigation miss a run that already ended
(function () {
  var QUnit = window.QUnit;
  // a polyfill broken at the root fails thousands of assertions, and the list travels in one response
  var LIMIT = 50;
  // the dump of a big collection runs into megabytes, and it is read in a log line
  var VALUE_LIMIT = 1000;
  var results = { done: false, failures: [] };

  function dump(value) {
    var text = QUnit.dump.parse(value);
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

  QUnit.done(function (details) {
    results.failed = details.failed;
    results.total = details.total;
    results.done = true;
  });

  // published last: without QUnit to attach to, the page has no reporter rather than a run that never ends
  window.qunitResults = results;
})();
