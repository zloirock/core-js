'use strict';
var toInteger = require('../internals/to-integer');
var parseInt = require('../internals/parse-int');
var INVALID_NUMBER_REPRESENTATION = 'Invalid number representation!';
var INVALID_RADIX = 'Invalid radix!';
var valid = /^[0-9a-z]+$/;

// https://github.com/mathiasbynens/proposal-number-fromstring
require('../internals/export')({ target: 'Number', stat: true }, {
  fromString: function fromString(string, radix) {
    var sign = 1;
    var R, mathNum;
    if (typeof string != 'string') throw new TypeError(INVALID_NUMBER_REPRESENTATION);
    if (!string.length) throw new SyntaxError(INVALID_NUMBER_REPRESENTATION);
    if (string.charAt(0) == '-') {
      sign = -1;
      string = string.slice(1);
      if (!string.length) throw new SyntaxError(INVALID_NUMBER_REPRESENTATION);
    }
    R = radix === undefined ? 10 : toInteger(radix);
    if (R < 2 || R > 36) throw new RangeError(INVALID_RADIX);
    if (!valid.test(string) || (mathNum = parseInt(string, R)).toString(R) !== string) {
      throw new SyntaxError(INVALID_NUMBER_REPRESENTATION);
    }
    return sign * mathNum;
  }
});
