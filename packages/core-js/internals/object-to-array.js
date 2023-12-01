'use strict';
var fails = require('../internals/fails');
var uncurryThis = require('../internals/function-uncurry-this');
var toObject = require('../internals/to-object');
var $propertyIsEnumerable = require('../internals/object-property-is-enumerable').f;

var objectKeys = Object.keys;
var getPrototypeOf = Object.getPrototypeOf;
var propertyIsEnumerable = uncurryThis($propertyIsEnumerable);
var push = uncurryThis([].push);

// in some IE versions, `propertyIsEnumerable` returns incorrect result on integer keys
// of `null` prototype objects
var IE_BUG = fails(function () {
  var O = Object.create(null);
  O[2] = 2;
  return !propertyIsEnumerable(O, 2);
});

// `Object.{ entries, values }` methods implementation
var createMethod = function (TO_ENTRIES) {
  return function (it) {
    var O = toObject(it);
    var keys = objectKeys(O);
    var IE_WORKAROUND = IE_BUG && getPrototypeOf(O) === null;
    var length = keys.length;
    var i = 0;
    var result = [];
    var key;
    while (length > i) {
      key = keys[i++];
      if (IE_WORKAROUND ? key in O : propertyIsEnumerable(O, key)) {
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
