'use strict';
var $ = require('../internals/export');
var uncurryThis = require('../internals/function-uncurry-this');
var aDataView = require('../internals/a-data-view');
var toIndex = require('../internals/to-index');
var f16round = require('../internals/math-f16round');

var EPSILON = 2.220446049250313e-16; // Number.EPSILON
var INVERSE_EPSILON = 1 / EPSILON;

var roundTiesToEven = function (n) {
  return n + INVERSE_EPSILON - INVERSE_EPSILON;
};

var minInfinity16 = 65520; // (2 - 2 ** -11) * 2 ** 15
var minNormal16 = 0.000061005353927612305; // (1 - 2 ** -11) * 2 ** -14
var recMinSubnormal16 = 16777216; // 2 ** 10 * 2 ** 14
var recSignificandDenom16 = 1024; // 2 ** 10;

function packFloat16(value) {
  // eslint-disable-next-line no-self-compare
  if (value !== value) return 0x7E00; // NaN
  if (value === 0) return (1 / value === -Infinity) << 15; // +0 or -0

  var neg = value < 0;
  if (neg) value = -value;
  if (value >= minInfinity16) return neg << 15 | 0x7C00; // Infinity
  if (value < minNormal16) return neg << 15 | roundTiesToEven(value * recMinSubnormal16); // subnormal

  // normal
  var exponent = Math.log(value) / Math.LN2 | 0;
  // we round from a value between 2 ** -15 * (1 + 1022/1024) (the largest subnormal) and 2 ** -14 * (1 + 0/1024) (the smallest normal)
  // to the latter (former impossible because of the subnormal check above)
  if (exponent === -15) return neg << 15 | recSignificandDenom16;
  var significand = roundTiesToEven((value * Math.pow(2, -exponent) - 1) * recSignificandDenom16);
  // we round from a value between 2 ** n * (1 + 1023/1024) and 2 ** (n + 1) * (1 + 0/1024) to the latter
  if (significand === recSignificandDenom16) return neg << 15 | exponent + 16 << 10;
  return neg << 15 | exponent + 15 << 10 | significand;
}

// eslint-disable-next-line es/no-typed-arrays -- safe
var setUint16 = uncurryThis(DataView.prototype.setUint16);

// `DataView.prototype.setFloat16` method
// https://github.com/tc39/proposal-float16array
$({ target: 'DataView', proto: true }, {
  setFloat16: function setFloat16(byteOffset, value /* , littleEndian */) {
    aDataView(this);
    var offset = toIndex(byteOffset);
    var bytes = packFloat16(f16round(value));
    return setUint16(this, offset, bytes, arguments.length > 2 ? arguments[2] : false);
  }
});
