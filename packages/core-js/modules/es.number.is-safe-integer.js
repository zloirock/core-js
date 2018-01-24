// 20.1.2.5 Number.isSafeInteger(number)
var isInteger = require('core-js-internals/is-integer');
var abs = Math.abs;

require('./_export')({ target: 'Number', stat: true }, {
  isSafeInteger: function isSafeInteger(number) {
    return isInteger(number) && abs(number) <= 0x1fffffffffffff;
  }
});
