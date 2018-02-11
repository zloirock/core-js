'use strict';
var internalStringPad = require('../internals/string-pad');
var userAgent = require('../internals/user-agent');
// https://github.com/zloirock/core-js/issues/280
var WEBKIT_BUG = /Version\/10\.\d+(\.\d+)? Safari\//.test(userAgent);

// `String.prototype.padEnd` method
// https://tc39.github.io/ecma262/#sec-string.prototype.padend
require('../internals/export')({ target: 'String', proto: true, forced: WEBKIT_BUG }, {
  padEnd: function padEnd(maxLength /* , fillString = ' ' */) {
    return internalStringPad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined, false);
  }
});
