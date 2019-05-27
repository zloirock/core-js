'use strict';
var $ = require('../internals/export');
var internalStringTrim = require('../internals/string-trim');
var forcedStringTrimMethod = require('../internals/forced-string-trim-method');

var FORCED = forcedStringTrimMethod('trimEnd');

var trimEnd = FORCED ? function trimEnd() {
  return internalStringTrim(this, 2);
} : ''.trimEnd;

// `String.prototype.{ trimEnd, trimRight }` methods
// https://github.com/tc39/ecmascript-string-left-right-trim
$({ target: 'String', proto: true, forced: FORCED }, {
  trimEnd: trimEnd,
  trimRight: trimEnd
});
