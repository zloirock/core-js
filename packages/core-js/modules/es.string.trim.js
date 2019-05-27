'use strict';
var $ = require('../internals/export');
var internalStringTrim = require('../internals/string-trim');
var forcedStringTrimMethod = require('../internals/forced-string-trim-method');

var FORCED = forcedStringTrimMethod('trim');

// `String.prototype.trim` method
// https://tc39.github.io/ecma262/#sec-string.prototype.trim
$({ target: 'String', proto: true, forced: FORCED }, {
  trim: function trim() {
    return internalStringTrim(this, 3);
  }
});
