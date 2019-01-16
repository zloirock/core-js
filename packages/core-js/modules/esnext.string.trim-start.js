'use strict';
var internalStringTrim = require('../internals/string-trim');
var FORCED = require('../internals/forced-string-trim-method')('trimStart');

var trimStart = FORCED ? function trimStart() {
  return internalStringTrim(this, 1);
} : ''.trimStart;

// `String.prototype.{ trimStart, trimLeft }` methods
// https://github.com/tc39/ecmascript-string-left-right-trim
require('../internals/export')({ target: 'String', proto: true, forced: FORCED }, {
  trimStart: trimStart,
  trimLeft: trimStart
});
