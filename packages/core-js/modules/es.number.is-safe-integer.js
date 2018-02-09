var isInteger = require('core-js-internals/is-integer');
var abs = Math.abs;

// `Number.isSafeInteger` method
// https://tc39.github.io/ecma262/#sec-number.issafeinteger
require('./_export')({ target: 'Number', stat: true }, {
  isSafeInteger: function isSafeInteger(number) {
    return isInteger(number) && abs(number) <= 0x1fffffffffffff;
  }
});
