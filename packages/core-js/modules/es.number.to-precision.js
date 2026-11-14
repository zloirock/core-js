'use strict';
var $ = require('../internals/export');
var uncurryThis = require('../internals/function-uncurry-this');
var toIntegerOrInfinity = require('../internals/to-integer-or-infinity');
var thisNumberValue = require('../internals/this-number-value');
var decimalDigits = require('../internals/number-decimal-digits');
var $repeat = require('../internals/string-repeat');
var fails = require('../internals/fails');

var $RangeError = RangeError;
var $String = String;
var $isFinite = isFinite;
var abs = Math.abs;
var nativeToPrecision = uncurryThis(1.1.toPrecision);
var repeat = uncurryThis($repeat);
var join = uncurryThis([].join);
var stringSlice = uncurryThis(''.slice);

var ROUNDS_PROPERLY = !fails(function () {
  // IE11-, Chakra-based Edge
  return nativeToPrecision(1.255, 3) !== '1.25'
    // FF86-
    || nativeToPrecision(12345, 4) !== '1.235e+4'
    // FF86-
    || nativeToPrecision(25, 1) !== '3e+1'
    // Rhino 1.8.1+ loses digits
    || nativeToPrecision(0.03125, 21) !== '0.0312500000000000000000'
    // Rhino 1.8.0-: garbage, Java exceptions and hangs on subnormals
    || nativeToPrecision(2.5e-323, 1) !== '2e-323';
});

// engines before ES2018 accept up to 21 digits
var ACCEPTS_100_DIGITS = !fails(function () {
  nativeToPrecision(1, 100);
});

var FORCED = !ROUNDS_PROPERLY || !ACCEPTS_100_DIGITS || fails(function () {
  // IE7-
  return nativeToPrecision(1, undefined) !== '1';
}) || !fails(function () {
  // V8 ~ Android 4.3-
  nativeToPrecision({});
}) || fails(function () {
  // Safari <11 && FF <50
  nativeToPrecision(Infinity, Infinity);
  nativeToPrecision(NaN, Infinity);
});

// `Number.prototype.toPrecision` method
// https://tc39.es/ecma262/#sec-number.prototype.toprecision
$({ target: 'Number', proto: true, forced: FORCED }, {
  toPrecision: function toPrecision(precision) {
    var x = thisNumberValue(this);
    if (precision === undefined) return $String(x);
    var p = toIntegerOrInfinity(precision);
    if (!$isFinite(x)) return $String(x);
    if (p < 1 || p > 100) throw new $RangeError('Incorrect precision');
    if (ROUNDS_PROPERLY && (p <= 21 || ACCEPTS_100_DIGITS)) return nativeToPrecision(x, p);
    var s = '';
    var e = 0;
    var m, digits;
    if (x < 0) {
      s = '-';
      x = -x;
    }
    if (x === 0) m = repeat('0', p);
    else {
      digits = [];
      e = decimalDigits(x, p - 1, false, digits);
      m = join(digits, '');
    }
    if (e < -6 || e >= p) {
      if (p !== 1) m = stringSlice(m, 0, 1) + '.' + stringSlice(m, 1);
      return s + m + 'e' + (e < 0 ? '-' : '+') + $String(abs(e));
    }
    if (e === p - 1) return s + m;
    if (e >= 0) return s + stringSlice(m, 0, e + 1) + '.' + stringSlice(m, e + 1);
    return s + '0.' + repeat('0', -(e + 1)) + m;
  }
});
