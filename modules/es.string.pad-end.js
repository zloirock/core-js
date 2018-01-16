'use strict';
// 21.1.3.13 String.prototype.padEnd(maxLength [ , fillString ])
var $pad = require('./_string-pad');
var userAgent = require('./_user-agent');

// https://github.com/zloirock/core-js/issues/280
require('./_export')({ target: 'String', proto: true, forced: /Version\/10\.\d+(\.\d+)? Safari\//.test(userAgent) }, {
  padEnd: function padEnd(maxLength /* , fillString = ' ' */) {
    return $pad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined, false);
  }
});
