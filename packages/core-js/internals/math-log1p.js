'use strict';
// eslint-disable-next-line es/no-math-log1p -- safe
var $log1p = Math.log1p;
var log = Math.log;

// `Math.log1p` method implementation
// https://tc39.es/ecma262/#sec-math.log1p
module.exports = (!$log1p
  // V8 ~ Chrome < 39 bug, imprecise: https://issues.chromium.org/issues/42206797
  // FF < 48 bug, the same: https://bugzilla.mozilla.org/show_bug.cgi?id=933257
  || $log1p(0.01) !== 0.009950330853168083
) ? function log1p(x) {
  var n = +x;
  if (n > -1e-8 && n < 1e-8) return n - n * n / 2;
  var u = 1 + n;
  return u === 1 ? n : n === u - 1 ? log(u) : n * log(u) / (u - 1);
} : $log1p;
