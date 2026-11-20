'use strict';
// Installed before the bundle in the frame and the standalone page. An uncaught error from either
// bundle evaluation or the exercise must reach the cell's verdict.
window.onerror = function (message, source, line) {
  if (window.e2eLoadError === undefined) window.e2eLoadError = String(message) + ' (' + source + ':' + line + ')';
  return false;
};
