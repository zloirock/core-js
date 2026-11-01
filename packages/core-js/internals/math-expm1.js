'use strict';
// eslint-disable-next-line es/no-math-expm1 -- safe
var $expm1 = Math.expm1;
var exp = Math.exp;
var log = Math.log;

// `Math.expm1` method implementation
// https://tc39.es/ecma262/#sec-math.expm1
module.exports = (!$expm1
  // Old FF bug
  // eslint-disable-next-line no-loss-of-precision -- required for old engines
  || $expm1(10) > 22025.465794806719 || $expm1(10) < 22025.4657948067165168
  // FF < 48 bug, imprecise on small arguments: https://bugzilla.mozilla.org/show_bug.cgi?id=933257
  || $expm1(1e-5) !== 0.000010000050000166668
  // Tor Browser bug
  || $expm1(-2e-17) !== -2e-17
) ? function expm1(x) {
  var n = +x;
  var u = exp(n);
  // `u - 1` loses the low bits of small results, Kahan's `log(u)` correction restores them
  return u === 1 ? n : n > -1 && n < 1 ? (u - 1) * n / log(u) : u - 1;
} : $expm1;
