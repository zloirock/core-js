'use strict';
module.exports = function (ExpectedError, exec, arg) {
  var CLOSED = false;
  try {
    exec.call({
      next: function () { return { done: true }; },
      'return': function () { CLOSED = true; }
    }, arg);
  } catch (error) {
    // https://bugs.webkit.org/show_bug.cgi?id=291195
    if (!(error instanceof ExpectedError)) return false;
  }
  return CLOSED;
};
