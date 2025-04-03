'use strict';
module.exports = function (exec, arg) {
  var CLOSED = false;
  try {
    exec.call({
      next: function () { return { done: true }; },
      'return': function () { CLOSED = true; }
    }, arg);
  } catch (error) { /** empty */ }
  return CLOSED;
};
