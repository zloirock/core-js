'use strict';
var log = Math.log;

// `Math.log1p` method implementation
// https://tc39.es/ecma262/#sec-math.log1p
// eslint-disable-next-line es/no-math-log1p -- safe
module.exports = Math.log1p || function log1p(x) {
  var n = +x;
  if (n > -1e-8 && n < 1e-8) return n - n * n / 2;
  var u = 1 + n;
  return u === 1 ? n : n === u - 1 ? log(u) : n * log(u) / (u - 1);
};
