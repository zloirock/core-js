'use strict';
var $ = require('../internals/export');
var $trimStart = require('../internals/string-trim-start');

// `String.prototype.trimStart` methods
// https://tc39.es/ecma262/#sec-string.prototype.trimstart
// eslint-disable-next-line es/no-string-prototype-trimstart-trimend -- safe
$({ target: 'String', proto: true, forced: ''.trimStart !== $trimStart }, {
  trimStart: $trimStart,
});
