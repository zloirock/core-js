'use strict';
var $trimEnd = require('../internals/string-trim').end;
var forcedStringTrimMethod = require('../internals/string-trim-forced');

// `String.prototype.{ trimEnd, trimRight }` methods
// https://tc39.es/ecma262/#sec-string.prototype.trimend
// https://tc39.es/ecma262/#String.prototype.trimright
module.exports = forcedStringTrimMethod('trimEnd') ? function trimEnd() {
  return $trimEnd(this);
} : ''.trimEnd;
