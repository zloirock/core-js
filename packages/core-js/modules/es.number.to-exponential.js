'use strict';
var $ = require('../internals/export');
var uncurryThis = require('../internals/function-uncurry-this');
var toIntegerOrInfinity = require('../internals/to-integer-or-infinity');
var thisNumberValue = require('../internals/this-number-value');
var $repeat = require('../internals/string-repeat');
var log10 = require('../internals/math-log10');
var fails = require('../internals/fails');

var $RangeError = RangeError;
var $String = String;
var $isFinite = isFinite;
var abs = Math.abs;
var floor = Math.floor;
var nativeToExponential = uncurryThis(1.1.toExponential);
var repeat = uncurryThis($repeat);
var join = uncurryThis([].join);
var stringSlice = uncurryThis(''.slice);

// big integers are little-endian arrays of base 1e4 digits, so their arithmetic fits int32:
// FF9-14 miscompile it with bigger intermediate values
var BASE = 1e4;
var LOG10_2 = 0.3010299956639812;
// 2 ** -52
var EPSILON = 2.220446049250313e-16;
// exact powers of ten
var POW10 = [1];
while (POW10.length <= 22) POW10[POW10.length] = POW10[POW10.length - 1] * 10;

// x * 10 ** k by exact powers of ten, each step is rounded once
var scale = function (x, k) {
  for (; k > 22; k -= 22) x *= POW10[22];
  for (; k < -22; k += 22) x /= POW10[22];
  return k < 0 ? x / POW10[-k] : x * POW10[k];
};

var toData = function (n) {
  var data = [];
  do {
    data[data.length] = n % BASE;
    n = floor(n / BASE);
  } while (n);
  return data;
};

// n <= 1e4, so the carry always fits one digit
var multiply = function (data, n) {
  var c = 0;
  for (var i = 0; i < data.length; i++) {
    c += n * data[i];
    data[i] = c % BASE;
    c = floor(c / BASE);
  }
  if (c) data[data.length] = c;
  return data;
};

var multiplyPow2 = function (data, exponent) {
  for (; exponent >= 13; exponent -= 13) multiply(data, 0x2000);
  return multiply(data, 1 << exponent);
};

var multiplyPow10 = function (data, exponent) {
  for (; exponent >= 4; exponent -= 4) multiply(data, BASE);
  return multiply(data, POW10[exponent]);
};

var compare = function (a, b) {
  if (a.length !== b.length) return a.length - b.length;
  for (var i = a.length - 1; i >= 0; i--) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
};

// a >= b
var subtract = function (a, b) {
  var borrow = 0;
  for (var i = 0; i < a.length; i++) {
    var digit = a[i] - borrow - (i < b.length ? b[i] : 0);
    borrow = digit < 0 ? 1 : 0;
    a[i] = digit + borrow * BASE;
  }
  while (a.length > 1 && !a[a.length - 1]) a.length--;
};

// fills `digits` with f + 1 digits of x > 0 rounded half up, returns the exponent
var exponentialDigits = function (x, f, digits) {
  var q = 0;
  // the estimated exponent can be off by one
  var e = floor(log10(x));
  var scaled = scale(x, f - e);
  var margin, n, delta, numerator, denominator, digit, i;
  if (scaled < POW10[f]) {
    e--;
    scaled = scale(x, f - e);
  } else if (scaled >= POW10[f + 1]) {
    e++;
    scaled = scale(x, f - e);
  }
  // the error of the scaled value is at most steps * scaled * 2 ** -53, a small margin also limits the scaled value
  margin = scaled * EPSILON * (1 + abs(f - e) / 22);
  n = floor(scaled);
  delta = scaled - n - 0.5;
  if (margin < 0.03) {
    // next to a power of ten, both possible exponents give the same result: the true value is within 1.5 * margin < 0.05 of it
    if (abs(scaled - POW10[f]) <= margin) n = POW10[f];
    // otherwise doubles are enough in the range of the exponent when the scaled value is not close to a rounding half
    else if (scaled < POW10[f] || scaled > POW10[f + 1] || abs(delta) <= margin) n = -1;
    else if (delta > 0) n++;
    if (n === POW10[f + 1]) {
      n = POW10[f];
      e++;
    }
    if (n >= 0) {
      digits[0] = $String(n);
      return e;
    }
  }
  // x = significand * 2 ** q with an integer significand
  while (x >= 0x20000000000000) {
    x /= 2;
    q++;
  }
  while (x < 0x10000000000000) {
    x *= 2;
    q--;
  }
  // x = numerator / denominator * 10 ** e exactly, the estimated e is the exact exponent or 1 more
  numerator = toData(x);
  denominator = [1];
  if (q > 0) multiplyPow2(numerator, q);
  else multiplyPow2(denominator, -q);
  e = floor((q + 53) * LOG10_2);
  if (e > 0) multiplyPow10(denominator, e);
  else multiplyPow10(numerator, -e);
  if (compare(numerator, denominator) < 0) {
    multiply(numerator, 10);
    e--;
  }
  for (i = 0; i <= f; i++) {
    if (i) multiply(numerator, 10);
    digit = 0;
    while (compare(numerator, denominator) >= 0) {
      subtract(numerator, denominator);
      digit++;
    }
    digits[i] = digit;
  }
  // round half up by the exact remainder
  if (compare(multiply(numerator, 2), denominator) >= 0) {
    for (i = f; digits[i] === 9; i--) digits[i] = 0;
    if (i < 0) {
      digits[0] = 1;
      e++;
    } else digits[i]++;
  }
  return e;
};

// Edge 17-
var ROUNDS_PROPERLY = nativeToExponential(-6.9e-11, 4) === '-6.9000e-11'
  // IE11- && Edge 14-
  && nativeToExponential(1.255, 2) === '1.25e+0'
  // FF86-, V8 ~ Chrome 49-50
  && nativeToExponential(12345, 3) === '1.235e+4'
  // FF86-, V8 ~ Chrome 49-50
  && nativeToExponential(25, 0) === '3e+1';

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

var FORCED = !ROUNDS_PROPERLY || !throwsOnInfinityFraction() || !properNonFiniteThisCheck();

// `Number.prototype.toExponential` method
// https://tc39.es/ecma262/#sec-number.prototype.toexponential
$({ target: 'Number', proto: true, forced: FORCED }, {
  toExponential: function toExponential(fractionDigits) {
    var x = thisNumberValue(this);
    if (fractionDigits === undefined) return nativeToExponential(x);
    var f = toIntegerOrInfinity(fractionDigits);
    if (!$isFinite(x)) return String(x);
    // TODO: ES2018 increased the maximum number of fraction digits to 100, need to improve the implementation
    if (f < 0 || f > 20) throw new $RangeError('Incorrect fraction digits');
    if (ROUNDS_PROPERLY) return nativeToExponential(x, f);
    var s = '';
    var m, e, c, d, digits;
    if (x < 0) {
      s = '-';
      x = -x;
    }
    if (x === 0) {
      e = 0;
      m = repeat('0', f + 1);
    } else {
      digits = [];
      e = exponentialDigits(x, f, digits);
      m = join(digits, '');
    }
    if (f !== 0) {
      m = stringSlice(m, 0, 1) + '.' + stringSlice(m, 1);
    }
    if (e === 0) {
      c = '+';
      d = '0';
    } else {
      c = e > 0 ? '+' : '-';
      d = $String(abs(e));
    }
    m += 'e' + c + d;
    return s + m;
  }
});
