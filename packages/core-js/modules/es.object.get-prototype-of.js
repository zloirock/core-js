var $ = require('../internals/export');
var fails = require('../internals/fails');
var toObject = require('../internals/to-object');

var nativeGetPrototypeOf = Object.getPrototypeOf;

var FAILS_ON_PRIMITIVES = fails(function () { nativeGetPrototypeOf(1); });

// `Object.getPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.getprototypeof
$({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES }, {
  getPrototypeOf: function getPrototypeOf(it) {
    return nativeGetPrototypeOf(toObject(it));
  },
});

