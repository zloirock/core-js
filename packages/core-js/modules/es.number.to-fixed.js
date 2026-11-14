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
var repeat = uncurryThis($repeat);
var join = uncurryThis([].join);
var stringSlice = uncurryThis(''.slice);
var nativeToFixed = uncurryThis(1.1.toFixed);

var ROUNDS_PROPERLY = !fails(function () {
  return nativeToFixed(0.00008, 3) !== '0.000' ||
    nativeToFixed(0.9, 0) !== '1' ||
    nativeToFixed(1.255, 2) !== '1.25' ||
    nativeToFixed(1000000000000000128.0, 0) !== '1000000000000000128' ||
    // Rhino 1.8.0-: garbage and hangs on subnormals
    nativeToFixed(5.054e-321, 0) !== '0';
});

// engines before ES2018 accept up to 20 digits
var ACCEPTS_100_DIGITS = !fails(function () {
  nativeToFixed(1, 100);
});

var FORCED = !ROUNDS_PROPERLY || !ACCEPTS_100_DIGITS || !fails(function () {
  // V8 ~ Android 4.3-
  nativeToFixed({});
});

// `Number.prototype.toFixed` method
// https://tc39.es/ecma262/#sec-number.prototype.tofixed
$({ target: 'Number', proto: true, forced: FORCED }, {
  toFixed: function toFixed(fractionDigits) {
    var number = thisNumberValue(this);
    var fractDigits = toIntegerOrInfinity(fractionDigits);
    var digits = [];
    var sign = '';
    var result, k;

    if (fractDigits < 0 || fractDigits > 100) throw new $RangeError('Incorrect fraction digits');
    // eslint-disable-next-line no-self-compare -- NaN check
    if (number !== number) return 'NaN';
    if (number <= -1e21 || number >= 1e21) return $String(number);
    if (ROUNDS_PROPERLY && (fractDigits <= 20 || ACCEPTS_100_DIGITS)) return nativeToFixed(number, fractDigits);
    if (number < 0) {
      sign = '-';
      number = -number;
    }
    if (number) decimalDigits(number, fractDigits, true, digits);
    result = join(digits, '') || '0';
    if (fractDigits > 0) {
      k = result.length;
      result = sign + (k <= fractDigits
        ? '0.' + repeat('0', fractDigits - k) + result
        : stringSlice(result, 0, k - fractDigits) + '.' + stringSlice(result, k - fractDigits));
    } else {
      result = sign + result;
    } return result;
  }
});
