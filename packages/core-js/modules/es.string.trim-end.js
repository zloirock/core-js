'use strict';
var $ = require('../internals/export');
var $trimEnd = require('../internals/string-trim-end');

// `String.prototype.trimEnd` methods
// https://tc39.es/ecma262/#sec-string.prototype.trimend
$({ target: 'String', proto: true, forced: ''.trimEnd !== $trimEnd }, {
  trimEnd: $trimEnd,
});
