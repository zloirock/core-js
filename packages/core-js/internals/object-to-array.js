'use strict';
var NAMES_ORDER = require('../internals/object-get-own-property-names-order');
var IE_NULL_PROTOTYPE_BUG = require('../internals/ie-null-prototype-bug');
var uncurryThis = require('../internals/function-uncurry-this');
var getOwnPropertyDescriptorModule = require('../internals/object-get-own-property-descriptor');
var getOwnPropertyNamesModule = require('../internals/object-get-own-property-names');
var objectKeys = require('../internals/object-keys');
var toIndexedObject = require('../internals/to-indexed-object');

var getPrototypeOf = Object.getPrototypeOf;
var push = uncurryThis([].push);

// `Object.{ entries, values }` methods implementation
var createMethod = function (TO_ENTRIES) {
  return function (it) {
    var O = toIndexedObject(it);
    var IE_WORKAROUND = IE_NULL_PROTOTYPE_BUG && getPrototypeOf(O) === null;
    var keys = NAMES_ORDER ? getOwnPropertyNamesModule.f(O) : objectKeys(O);
    var length = keys.length;
    var i = 0;
    var result = [];
    var key, descriptor;
    while (length > i) {
      key = keys[i++];
      descriptor = getOwnPropertyDescriptorModule.f(O, key);
      if (descriptor ? descriptor.enumerable : IE_WORKAROUND && key in O) {
        push(result, TO_ENTRIES ? [key, O[key]] : O[key]);
      }
    }
    return result;
  };
};

module.exports = {
  // `Object.entries` method
  // https://tc39.es/ecma262/#sec-object.entries
  entries: createMethod(true),
  // `Object.values` method
  // https://tc39.es/ecma262/#sec-object.values
  values: createMethod(false),
};
