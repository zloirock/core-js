'use strict';
var internalCodePointAt = require('./_string-at')(false);

// `String.prototype.codePointAt` method
// https://tc39.github.io/ecma262/#sec-string.prototype.codepointat
require('./_export')({ target: 'String', proto: true }, {
  codePointAt: function codePointAt(pos) {
    return internalCodePointAt(this, pos);
  }
});
