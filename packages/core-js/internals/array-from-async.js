'use strict';
var bind = require('../internals/function-bind-context');
var isConstructor = require('../internals/is-constructor');
var toObject = require('../internals/to-object');
var lengthOfArrayLike = require('../internals/length-of-array-like');
var createProperty = require('../internals/create-property');
var setArrayLength = require('../internals/array-set-length');
var getAsyncIterator = require('../internals/get-async-iterator');
var getIterator = require('../internals/get-iterator-internal');
var getIteratorDirect = require('../internals/get-iterator-direct');
var getIteratorMethod = require('../internals/get-iterator-method-internal');
var getMethod = require('../internals/get-method');
var getBuiltIn = require('../internals/get-built-in');
var wellKnownSymbol = require('../internals/well-known-symbol');
var AsyncFromSyncIterator = require('../internals/async-from-sync-iterator');
var toArray = require('../internals/async-iterator-iteration').toArray;

var $Array = Array;
var ASYNC_ITERATOR = wellKnownSymbol('asyncIterator');

// `Array.fromAsync` method implementation
// https://tc39.es/ecma262/#sec-array.fromasync
module.exports = function fromAsync(items /* , mapfn = undefined, thisArg = undefined */) {
  var C = this;
  var argumentsLength = arguments.length;
  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
  var thisArg = argumentsLength > 2 ? arguments[2] : undefined;
  var Promise = getBuiltIn('Promise');
  return new Promise(function (resolve, reject) {
    if (mapfn !== undefined) mapfn = bind(mapfn, thisArg);
    var usingAsyncIterator = getMethod(items, ASYNC_ITERATOR);
    var usingSyncIterator = usingAsyncIterator ? undefined : getIteratorMethod(items);
    if (usingAsyncIterator || usingSyncIterator) {
      var iterator = usingAsyncIterator
        ? getAsyncIterator(items, usingAsyncIterator)
        : new AsyncFromSyncIterator(getIteratorDirect(getIterator(items, usingSyncIterator)));
      var record = getIteratorDirect(iterator);
      resolve(toArray(record, mapfn, isConstructor(C) ? new C() : [], true));
      return;
    }
    var O = toObject(items);
    var length = lengthOfArrayLike(O);
    var A = isConstructor(C) ? new C(length) : new $Array(length);
    var index = 0;

    var add = function (value) {
      try {
        createProperty(A, index++, value);
        loop();
      } catch (error) { reject(error); }
    };

    var onValue = function (value) {
      try {
        if (mapfn) Promise.resolve(mapfn(value, index)).then(add, reject);
        else add(value);
      } catch (error) { reject(error); }
    };

    var loop = function () {
      try {
        if (index < length) Promise.resolve(O[index]).then(onValue, reject);
        else {
          setArrayLength(A, length);
          resolve(A);
        }
      } catch (error) { reject(error); }
    };

    loop();
  });
};
