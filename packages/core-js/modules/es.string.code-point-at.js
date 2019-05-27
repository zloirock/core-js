'use strict';
var $ = require('../internals/export');
var internalCodePointAt = require('../internals/string-at');

// `String.prototype.codePointAt` method
// https://tc39.github.io/ecma262/#sec-string.prototype.codepointat
$({ target: 'String', proto: true }, {
  codePointAt: function codePointAt(pos) {
    return internalCodePointAt(this, pos);
  }
});
