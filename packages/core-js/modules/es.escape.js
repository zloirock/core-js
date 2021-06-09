'use strict';
var $ = require('../internals/export');

var pow = Math.pow;
var raw = /[\w*+\-./@]/;

// `escape` method
// https://tc39.es/ecma262/#sec-escape-string
$({ global: true }, {
  escape: function escape(string) {
    var str = String(string);
    var result = '';
    var length = str.length;
    var index = 0;
    var chr, code;
    var get = function (r, up) {
      var hex = (((code / pow(16, r)) | 0) % 16).toString(16);
      return up ? hex.toUpperCase() : hex;
    };
    while (index < length) {
      chr = str.charAt(index++);
      if (raw.test(chr)) {
        result += chr;
      } else {
        code = chr.charCodeAt(0);
        if (code < 256) {
          result += '%' + get(1) + get(0);
        } else {
          result += '%u' + get(4, 1) + get(3, 1) + get(1, 1) + get(0, 1);
        }
      }
    } return result;
  }
});
