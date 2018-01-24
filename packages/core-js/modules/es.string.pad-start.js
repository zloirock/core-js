'use strict';
// 21.1.3.14 String.prototype.padStart(maxLength [ , fillString ])
var $pad = require('./_string-pad');
var userAgent = require('core-js-internals/user-agent');

// https://github.com/zloirock/core-js/issues/280
require('./_export')({ target: 'String', proto: true, forced: /Version\/10\.\d+(\.\d+)? Safari\//.test(userAgent) }, {
  padStart: function padStart(maxLength /* , fillString = ' ' */) {
    return $pad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined, true);
  }
});
