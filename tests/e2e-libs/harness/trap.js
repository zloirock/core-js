'use strict';
// The first script of a cell's frame, ahead of its bundle. A bundle that throws while it loads leaves
// no `E2E.run` behind, and without this the frame could only report THAT, not what threw.
window.onerror = function (message, source, line) {
  if (window.e2eLoadError === undefined) window.e2eLoadError = String(message) + ' (' + source + ':' + line + ')';
  return false;
};
