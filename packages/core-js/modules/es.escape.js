'use strict';
var $ = require('../internals/export');
var uncurryThis = require('../internals/function-uncurry-this');
var toString = require('../internals/to-string');

var charAt = uncurryThis(''.charAt);
var charCodeAt = uncurryThis(''.charCodeAt);
var exec = uncurryThis(/./.exec);
var numberToString = uncurryThis(1.1.toString);
var toUpperCase = uncurryThis(''.toUpperCase);
var join = uncurryThis([].join);
var $Array = Array;

var raw = /[\w*+\-./@]/;

var hex = function (code, length) {
  var result = numberToString(code, 16);
  while (result.length < length) result = '0' + result;
  return result;
};

// `escape` method
// https://tc39.es/ecma262/#sec-escape-string
$({ global: true }, {
  escape: function escape(string) {
    var str = toString(string);
    var length = str.length;
    var result = $Array(length);
    var index;
    var chr, code;
    for (index = 0; index < length; index++) {
      chr = charAt(str, index);
      if (exec(raw, chr)) {
        result[index] = chr;
      } else {
        code = charCodeAt(chr, 0);
        if (code < 256) {
          result[index] = '%' + toUpperCase(hex(code, 2));
        } else {
          result[index] = '%u' + toUpperCase(hex(code, 4));
        }
      }
    } return join(result, '');
  }
});
