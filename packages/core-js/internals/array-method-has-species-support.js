'use strict';
var fails = require('../internals/fails');
var wellKnownSymbol = require('../internals/well-known-symbol');
var V8_VERSION = require('../internals/environment-v8-version');

var SPECIES = wellKnownSymbol('species');

module.exports = function (METHOD_NAME) {
  // We can't use this feature detection in V8 since it causes
  // deoptimization and serious performance degradation
  // https://github.com/zloirock/core-js/issues/677
  return V8_VERSION >= 51 || !fails(function () {
    var array = [1];
    var constructor = array.constructor = {};
    constructor[SPECIES] = function (length) {
      // Rhino 1.9.0 - 1.9.2 passes 0 to the species constructor even when splice deletes elements.
      // https://github.com/mozilla/rhino/blob/ae05f8160ee90d23e67e38fb5d4005771a2ace3f/rhino/src/main/java/org/mozilla/javascript/NativeArray.java#L1317-L1335
      // With no arguments, splice also discards the species result.
      // https://github.com/mozilla/rhino/issues/2589
      return { foo: METHOD_NAME === 'splice' ? length : 1 };
    };
    return array[METHOD_NAME](Boolean).foo !== 1;
  });
};
