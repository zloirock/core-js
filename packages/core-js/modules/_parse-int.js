var $parseInt = require('core-js-internals/global').parseInt;
var $trim = require('./_string-trim').trim;
var ws = require('core-js-internals/whitespaces');
var hex = /^[-+]?0[xX]/;

module.exports = $parseInt(ws + '08') !== 8 || $parseInt(ws + '0x16') !== 22 ? function parseInt(str, radix) {
  var string = $trim(String(str), 3);
  return $parseInt(string, (radix >>> 0) || (hex.test(string) ? 16 : 10));
} : $parseInt;
