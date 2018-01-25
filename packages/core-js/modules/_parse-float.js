var $parseFloat = require('core-js-internals/global').parseFloat;
var $trim = require('./_string-trim').trim;
var whitespaces = require('core-js-internals/whitespaces');

module.exports = 1 / $parseFloat(whitespaces + '-0') !== -Infinity ? function parseFloat(str) {
  var string = $trim(String(str), 3);
  var result = $parseFloat(string);
  return result === 0 && string.charAt(0) == '-' ? -0 : result;
} : $parseFloat;
