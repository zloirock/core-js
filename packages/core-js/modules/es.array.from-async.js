// type: proposals/array-from-async.d.ts
'use strict';
var $ = require('../internals/export');
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
var fails = require('../internals/fails');
var V8_VERSION = require('../internals/environment-v8-version');
var ENVIRONMENT = require('../internals/environment');

var $Array = Array;
var ASYNC_ITERATOR = wellKnownSymbol('asyncIterator');

// eslint-disable-next-line es/no-array-fromasync -- safe
var nativeFromAsync = Array.fromAsync;
// V8 incorrectly closes iterators on step errors and retries failed cleanup.
// https://issues.chromium.org/issues/511947515
// This cannot be detected synchronously.
var FORCED = V8_VERSION && ENVIRONMENT !== 'BUN' || !nativeFromAsync || fails(function () {
  // https://bugs.webkit.org/show_bug.cgi?id=271703
  var counter = 0;
  nativeFromAsync.call(function () {
    counter++;
    return [];
  }, { length: 0 });
  if (counter !== 1) return true;
  // Firefox and Safari do not capture `next` before calling the constructor.
  // https://bugzilla.mozilla.org/show_bug.cgi?id=2088041
  // https://bugs.webkit.org/show_bug.cgi?id=326074
  // This also avoids Firefox masking the original error when cleanup rejects.
  // https://bugzilla.mozilla.org/show_bug.cgi?id=2078778
  var changedNextCalled = false;
  var iterable = {};
  var iterator = { next: function () { return { done: true }; } };
  iterable[wellKnownSymbol('asyncIterator')] = function () { return iterator; };
  nativeFromAsync.call(function () {
    iterator.next = function () {
      changedNextCalled = true;
      return { done: true };
    };
    return [];
  }, iterable);
  return changedNextCalled;
});

// `Array.fromAsync` method
// https://tc39.es/ecma262/#sec-array.fromasync
$({ target: 'Array', stat: true, forced: FORCED }, {
  fromAsync: function fromAsync(items /* , mapfn = undefined, thisArg = undefined */) {
    var C = this;
    var argumentsLength = arguments.length;
    var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
    var thisArg = argumentsLength > 2 ? arguments[2] : undefined;
    // @dependency: es.promise.constructor
    // @dependency: es.promise.catch
    // @dependency: es.promise.finally
    var Promise = getBuiltIn('Promise');
    return new Promise(function (resolve, reject) {
      if (mapfn !== undefined) mapfn = bind(mapfn, thisArg);
      var usingAsyncIterator = getMethod(items, ASYNC_ITERATOR);
      // @dependency: es.array.iterator
      // @dependency: es.string.iterator
      var usingSyncIterator = usingAsyncIterator === undefined ? getIteratorMethod(items) : undefined;
      if (usingAsyncIterator !== undefined || usingSyncIterator !== undefined) {
        var iterator = usingAsyncIterator !== undefined
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
  },
});
