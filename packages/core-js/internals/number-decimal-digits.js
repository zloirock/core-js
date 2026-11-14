'use strict';
var log10 = require('../internals/math-log10');

var $String = String;
var abs = Math.abs;
var floor = Math.floor;

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

// the exact digits and exponent by big integers
var exactDigits = function (x, f, fixed, digits) {
  var q = 0;
  var count = f + 1;
  var numerator, denominator, e, digit, i;
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
  if (fixed) {
    count += e;
    // no digits before the rounding position, the remainder is compared with a half of its unit
    if (count < 1) multiplyPow10(denominator, 1 - count);
  }
  for (i = 0; i < count; i++) {
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
    for (i = count - 1; digits[i] === 9; i--) digits[i] = 0;
    if (i < 0) {
      digits[0] = 1;
      // the carry adds an integer digit
      if (fixed && count > 0) digits[count] = 0;
      e++;
    } else digits[i]++;
  }
  return e;
};

// fills `digits` with decimal digits of x > 0 rounded half up
// fixed: the digits of the integer closest to x * 10 ** f, for zero - nothing or 0
// otherwise: f + 1 significant digits, their decimal exponent is returned
module.exports = function (x, f, fixed, digits) {
  var e = 0;
  var lower = -1;
  var upper = Infinity;
  var scaled, margin, n, delta;
  // doubles represent only a small scaled value exactly enough
  if (fixed || f < 15) {
    if (fixed) scaled = scale(x, f);
    else {
      lower = POW10[f];
      upper = POW10[f + 1];
      // the estimated exponent can be off by one
      e = floor(log10(x));
      scaled = scale(x, f - e);
      if (scaled < lower) {
        e--;
        scaled = scale(x, f - e);
      } else if (scaled >= upper) {
        e++;
        scaled = scale(x, f - e);
      }
    }
    // the error of the scaled value is at most steps * scaled * 2 ** -53, a small margin also limits the scaled value
    margin = scaled * EPSILON * (1 + abs(f - e) / 22);
    n = floor(scaled);
    delta = scaled - n - 0.5;
    if (margin < 0.03) {
      // next to a power of ten, both possible exponents give the same result: the true value is within 1.5 * margin < 0.05 of it
      if (abs(scaled - lower) <= margin) n = lower;
      // otherwise doubles are enough in the range of the exponent when the scaled value is not close to a rounding half
      else if (scaled < lower || scaled > upper || abs(delta) <= margin) n = -1;
      else if (delta > 0) n++;
      if (n === upper) {
        n = lower;
        e++;
      }
      if (n >= 0) {
        digits[0] = $String(n);
        return e;
      }
    }
  }
  return exactDigits(x, f, fixed, digits);
};
