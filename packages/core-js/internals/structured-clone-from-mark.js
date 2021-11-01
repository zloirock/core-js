var global = require('../internals/global');
var call = require('../internals/function-call');
var fails = require('../internals/fails');
var uid = require('../internals/uid');

var performance = global.performance;
var mark = performance && performance.mark;
var clearMarks = performance && performance.clearMarks;
var MARK = uid('structuredClone');

var structuredClone = function (value) {
  var clone = call(mark, performance, MARK, { detail: value }).detail;
  call(clearMarks, performance, MARK);
  return clone;
};

module.exports = !fails(function () {
  // eslint-disable-next-line es/no-set -- safe
  var set = new Set([42]);
  var clone = structuredClone(set);
  return clone === set || !set.has(42);
}) && structuredClone;
