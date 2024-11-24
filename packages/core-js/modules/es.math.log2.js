'use strict';
var $ = require('../internals/export');

// eslint-disable-next-line es/no-math-log2 -- required for testing
var $log2 = Math.log2;
var log = Math.log;
var LN2 = Math.LN2;
var pow = Math.pow;
var round = Math.round;

function log2(x) {
  var n = +x;
  var result = log(n) / LN2;
  var k = round(result);
  // the change of the base is inexact on powers of two too
  return pow(2, k) === n ? k : result;
}

var FORCED = !$log2
  // V8 ~ Chrome < 41 and Rhino < 1.9.2 bug, inexact on powers of two: https://issues.chromium.org/issues/42206893
  // https://github.com/mozilla/rhino/pull/2522
  || $log2(8) !== 3
  // FF < 48 bug, the same on other powers: https://bugzilla.mozilla.org/show_bug.cgi?id=933257
  || $log2(536870912) !== 29;

// `Math.log2` method
// https://tc39.es/ecma262/#sec-math.log2
$({ target: 'Math', stat: true, forced: FORCED }, {
  log2: log2,
});
