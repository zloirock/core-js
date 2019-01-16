'use strict';
var internalStringTrim = require('../internals/string-trim');
var FORCED = require('../internals/forced-string-trim-method')('trim');

// `String.prototype.trim` method
// https://tc39.github.io/ecma262/#sec-string.prototype.trim
require('../internals/export')({ target: 'String', proto: true, forced: FORCED }, {
  trim: function trim() {
    return internalStringTrim(this, 3);
  }
});
