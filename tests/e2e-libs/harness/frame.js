'use strict';
// A cell's frame: its bundle alone in a realm of its own, run there and the result handed to the
// driver in the parent page (`qunit.js`). The run is bounded here, the way the artifact page bounds it,
// so a run that never settles is reported as one rather than as a frame that went silent.
(function () {
  var CELL = window.E2E_CELL;
  var sent = false;

  function send(checks, reason) {
    if (sent) return;
    sent = true;
    window.parent.e2eFrameDone(CELL.label, CELL.expected, window.e2eCompatibilityMode(), checks, reason);
  }

  if (typeof E2E === 'undefined' || !E2E || typeof E2E.run !== 'function') {
    send(null, 'the bundle did not load - ' + (window.e2eLoadError || 'no error was reported'));
    return;
  }
  setTimeout(function () {
    send(null, 'run() did not settle within ' + CELL.timeout + 'ms');
  }, CELL.timeout);
  window.e2eRun(function (checks) {
    send(checks, null);
  }, function (err) {
    send(null, 'run() threw - ' + window.e2eReason(err));
  });
}());
