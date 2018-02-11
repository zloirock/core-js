var nativeParseFloat = require('core-js-internals/global').parseFloat;
var internalStringTrim = require('../internals/string-trim').trim;
var whitespaces = require('core-js-internals/whitespaces');
var FORCED = 1 / nativeParseFloat(whitespaces + '-0') !== -Infinity;

module.exports = FORCED ? function parseFloat(str) {
  var string = internalStringTrim(String(str), 3);
  var result = nativeParseFloat(string);
  return result === 0 && string.charAt(0) == '-' ? -0 : result;
} : nativeParseFloat;
