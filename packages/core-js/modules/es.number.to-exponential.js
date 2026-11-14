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
var nativeToExponential = uncurryThis(1.1.toExponential);
var repeat = uncurryThis($repeat);
var join = uncurryThis([].join);
var charAt = uncurryThis(''.charAt);
var stringIndexOf = uncurryThis(''.indexOf);
var stringSlice = uncurryThis(''.slice);

var ROUNDS_PROPERLY = !fails(function () {
  // Edge 17-
  return nativeToExponential(-6.9e-11, 4) !== '-6.9000e-11'
    // IE11- && Edge 14-
    || nativeToExponential(1.255, 2) !== '1.25e+0'
    // Chakra-based Edge
    || nativeToExponential(0.35, 0) !== '3e-1'
    // FF86-, V8 ~ Chrome 49-50
    || nativeToExponential(12345, 3) !== '1.235e+4'
    // FF86-, V8 ~ Chrome 49-50
    || nativeToExponential(25, 0) !== '3e+1'
    // Rhino 1.8.0-: garbage, Java exceptions and hangs on subnormals
    || nativeToExponential(2.5e-323, 0) !== '2e-323';
});

var PROPER_SHORTEST = !fails(function () {
  // Rhino 1.8.0-: garbage on subnormals without fraction digits too
  return nativeToExponential(2.5e-323) !== '2.5e-323';
});

// engines before ES2018 accept up to 20 digits
var ACCEPTS_100_DIGITS = !fails(function () {
  nativeToExponential(1, 100);
});

// IE8-
var throwsOnInfinityFraction = function () {
  return fails(function () {
    nativeToExponential(1, Infinity);
  }) && fails(function () {
    nativeToExponential(1, -Infinity);
  });
};

// Safari <11 && FF <50
var properNonFiniteThisCheck = function () {
  return !fails(function () {
    nativeToExponential(Infinity, Infinity);
    nativeToExponential(NaN, Infinity);
  });
};

var FORCED = !ROUNDS_PROPERLY || !PROPER_SHORTEST || !ACCEPTS_100_DIGITS || !throwsOnInfinityFraction() || !properNonFiniteThisCheck();

// `Number.prototype.toExponential` method
// https://tc39.es/ecma262/#sec-number.prototype.toexponential
$({ target: 'Number', proto: true, forced: FORCED }, {
  toExponential: function toExponential(fractionDigits) {
    var x = thisNumberValue(this);
    var shortest = fractionDigits === undefined;
    if (shortest && PROPER_SHORTEST) return nativeToExponential(x);
    var f = shortest ? 0 : toIntegerOrInfinity(fractionDigits);
    if (!$isFinite(x)) return $String(x);
    if (f < 0 || f > 100) throw new $RangeError('Incorrect fraction digits');
    if (!shortest && ROUNDS_PROPERLY && (f <= 20 || ACCEPTS_100_DIGITS)) return nativeToExponential(x, f);
    var s = '';
    var m, e, digits, point;
    if (x < 0) {
      s = '-';
      x = -x;
    }
    if (x === 0) {
      e = 0;
      m = repeat('0', f + 1);
    } else if (shortest) {
      // the digits and the exponent from the shortest representation
      m = $String(x);
      point = stringIndexOf(m, 'e');
      e = point < 0 ? 0 : +stringSlice(m, point + 1);
      if (point >= 0) m = stringSlice(m, 0, point);
      point = stringIndexOf(m, '.');
      if (point < 0) point = m.length;
      else m = stringSlice(m, 0, point) + stringSlice(m, point + 1);
      e += point - 1;
      for (; charAt(m, 0) === '0'; e--) m = stringSlice(m, 1);
      while (charAt(m, m.length - 1) === '0') m = stringSlice(m, 0, -1);
      f = m.length - 1;
    } else {
      digits = [];
      e = decimalDigits(x, f, false, digits);
      m = join(digits, '');
    }
    if (f !== 0) m = stringSlice(m, 0, 1) + '.' + stringSlice(m, 1);
    return s + m + 'e' + (e < 0 ? '-' : '+') + $String(abs(e));
  }
});
