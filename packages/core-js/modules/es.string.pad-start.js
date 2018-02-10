'use strict';
var internalStringPad = require('./_string-pad');
var userAgent = require('core-js-internals/user-agent');
// https://github.com/zloirock/core-js/issues/280
var WEBKIT_BUG = /Version\/10\.\d+(\.\d+)? Safari\//.test(userAgent);

// `String.prototype.padStart` method
// https://tc39.github.io/ecma262/#sec-string.prototype.padstart
require('./_export')({ target: 'String', proto: true, forced: WEBKIT_BUG }, {
  padStart: function padStart(maxLength /* , fillString = ' ' */) {
    return internalStringPad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined, true);
  }
});
