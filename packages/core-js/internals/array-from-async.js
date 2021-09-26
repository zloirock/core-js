'use strict';
var bind = require('../internals/function-bind-context');
var toObject = require('../internals/to-object');
var isConstructor = require('../internals/is-constructor');
var getAsyncIterator = require('../internals/get-async-iterator');
var getIterator = require('../internals/get-iterator');
var getIteratorMethod = require('../internals/get-iterator-method');
var getMethod = require('../internals/get-method');
var getVirtual = require('../internals/entry-virtual');
var wellKnownSymbol = require('../internals/well-known-symbol');
var AsyncFromSyncIterator = require('../internals/async-from-sync-iterator');
var toArray = require('../internals/async-iterator-iteration').toArray;

var ASYNC_ITERATOR = wellKnownSymbol('asyncIterator');
var arrayIterator = getVirtual('Array').values;

// `Array.fromAsync` method implementation
// https://github.com/tc39/proposal-array-from-async
module.exports = function fromAsync(asyncItems /* , mapfn = undefined, thisArg = undefined */) {
  var O = toObject(asyncItems);
  var argumentsLength = arguments.length;
  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
  if (mapfn !== undefined) mapfn = bind(mapfn, argumentsLength > 2 ? arguments[2] : undefined, 2);
  var usingAsyncIterator = getMethod(O, ASYNC_ITERATOR);
  var usingSyncIterator = usingAsyncIterator ? undefined : getIteratorMethod(O) || arrayIterator;
  var A = isConstructor(this) ? new this() : [];
  var iterator = usingAsyncIterator
    ? getAsyncIterator(O, usingAsyncIterator)
    : new AsyncFromSyncIterator(getIterator(O, usingSyncIterator));
  return toArray(iterator, mapfn, A);
};
