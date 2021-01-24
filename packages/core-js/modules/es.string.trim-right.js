'use strict';
var $ = require('../internals/export');
var $trimEnd = require('../internals/string-trim-end');

// `String.prototype.trimRight` methods
// https://tc39.es/ecma262/#String.prototype.trimright
$({ target: 'String', proto: true, forced: ''.trimRight !== $trimEnd }, {
  trimRight: $trimEnd,
});
