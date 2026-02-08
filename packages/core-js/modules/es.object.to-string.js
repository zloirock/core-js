'use strict';
var $ = require('../internals/export');
var TO_STRING_TAG_SUPPORT = require('../internals/to-string-tag-support');
var toString = require('../internals/object-to-string');

// `Object.prototype.toString` method
// https://tc39.es/ecma262/#sec-object.prototype.tostring
$({ target: 'Object', proto: true, forced: !TO_STRING_TAG_SUPPORT }, {
  toString: toString,
});
