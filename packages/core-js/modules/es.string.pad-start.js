'use strict';
var internalStringPad = require('../internals/string-pad');
var WEBKIT_BUG = require('../internals/webkit-string-pad-bug');

// `String.prototype.padStart` method
// https://tc39.github.io/ecma262/#sec-string.prototype.padstart
require('../internals/export')({ target: 'String', proto: true, forced: WEBKIT_BUG }, {
  padStart: function padStart(maxLength /* , fillString = ' ' */) {
    return internalStringPad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined, true);
  }
});
