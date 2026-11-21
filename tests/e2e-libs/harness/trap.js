'use strict';
// Installed before the bundle in the frame and the standalone page. An uncaught error from either
// bundle evaluation or the exercise must reach the cell's verdict.
(function () {
  function record(failure) {
    if (window.e2eUncaughtError !== undefined) return;
    window.e2eUncaughtError = failure;
    if (window.e2eOnUncaughtError) window.e2eOnUncaughtError();
  }

  window.addEventListener('error', function (event) {
    record({ message: event.message + ' (' + event.filename + ':' + event.lineno + ')' });
  });

  window.addEventListener('unhandledrejection', function (event) {
    record({ rejection: event.reason });
  });
}());
