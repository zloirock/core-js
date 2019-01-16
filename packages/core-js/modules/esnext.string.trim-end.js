'use strict';
var internalStringTrim = require('../internals/string-trim');
var FORCED = require('../internals/forced-string-trim-method')('trimEnd');

var trimEnd = FORCED ? function trimEnd() {
  return internalStringTrim(this, 2);
} : ''.trimEnd;

// `String.prototype.{ trimEnd, trimRight }` methods
// https://github.com/tc39/ecmascript-string-left-right-trim
require('../internals/export')({ target: 'String', proto: true, forced: FORCED }, {
  trimEnd: trimEnd,
  trimRight: trimEnd
});
