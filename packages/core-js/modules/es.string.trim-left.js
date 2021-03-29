'use strict';
var $ = require('../internals/export');
var $trimStart = require('../internals/string-trim-start');

// `String.prototype.trimLeft` methods
// https://tc39.es/ecma262/#String.prototype.trimleft
$({ target: 'String', proto: true, forced: ''.trimLeft !== $trimStart }, {
  trimLeft: $trimStart,
});
