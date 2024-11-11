'use strict';
var $ = require('../internals/export');
var uncurryThis = require('../internals/function-uncurry-this');

const expMask16 = 2 ** 5 - 1, significandMask16 = 2 ** 10 - 1, minSubnormal16 = 2 ** -10 * 2 ** -14, significandDenom16 = 2 ** -10;

function unpackFloat16(bytes) {
	const sign = bytes >>> 15;
	const exponent = bytes >>> 10 & expMask16;
	const significand = bytes & significandMask16;
	if (exponent === expMask16) return significand === 0 ? (sign === 0 ? Infinity : -Infinity) : NaN;
	if (exponent === 0) return significand * (sign === 0 ? minSubnormal16 : -minSubnormal16);
	return 2 ** (exponent - 15) * (sign === 0 ? 1 + significand * significandDenom16 : -1 - significand * significandDenom16);
}

// eslint-disable-next-line es/no-typed-arrays -- safe
var getUint16 = uncurryThis(DataView.prototype.getUint16);

// `DataView.prototype.getFloat16` method
// https://github.com/tc39/proposal-float16array
$({ target: 'DataView', proto: true }, {
  getFloat16: function getFloat16(byteOffset /* , littleEndian */) {
    var uint16 = getUint16(this, byteOffset, arguments.length > 1 ? arguments[1] : false);
    return unpackFloat16(uint16);
  }
});
