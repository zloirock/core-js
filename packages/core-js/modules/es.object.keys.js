'use strict';
var $ = require('../internals/export');
var toObject = require('../internals/to-object');
var fails = require('../internals/fails');

var nativeObjectKeys = Object.keys;

var FAILS_ON_PRIMITIVES = fails(function () { nativeObjectKeys(1); });

// `Object.keys` method
// https://tc39.es/ecma262/#sec-object.keys
$({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES }, {
  keys: function keys(it) {
    return nativeObjectKeys(toObject(it));
  },
});
