'use strict';
var call = require('../internals/function-call');
var anObject = require('../internals/an-object');
var getMethod = require('../internals/get-method');
var defineBuiltIns = require('../internals/define-built-ins');
var setInternalState = require('../internals/internal-state').set;
var internalStateGetterFor = require('../internals/internal-state-getter-for');
var getBuiltIn = require('../internals/get-built-in');
var AsyncIteratorPrototype = require('../internals/async-iterator-prototype');
var createIterResultObject = require('../internals/create-iter-result-object');

// dependency: es.promise.constructor
// dependency: es.promise.catch
// dependency: es.promise.finally
// dependency: es.promise.resolve
var Promise = getBuiltIn('Promise');

var ASYNC_FROM_SYNC_ITERATOR = 'AsyncFromSyncIterator';
var getInternalState = internalStateGetterFor(ASYNC_FROM_SYNC_ITERATOR);

var asyncFromSyncIteratorContinuation = function (result, resolve, reject) {
  var done = result.done;
  Promise.resolve(result.value).then(function (value) {
    resolve(createIterResultObject(value, done));
  }, reject);
};

var AsyncFromSyncIterator = function AsyncIterator(iteratorRecord) {
  iteratorRecord.type = ASYNC_FROM_SYNC_ITERATOR;
  setInternalState(this, iteratorRecord);
};

AsyncFromSyncIterator.prototype = defineBuiltIns(Object.create(AsyncIteratorPrototype), {
  next: function next() {
    var state = getInternalState(this);
    return new Promise(function (resolve, reject) {
      var result = anObject(call(state.next, state.iterator));
      asyncFromSyncIteratorContinuation(result, resolve, reject);
    });
  },
  return: function () {
    var iterator = getInternalState(this).iterator;
    return new Promise(function (resolve, reject) {
      var $return = getMethod(iterator, 'return');
      if ($return === undefined) return resolve(createIterResultObject(undefined, true));
      var result = anObject(call($return, iterator));
      asyncFromSyncIteratorContinuation(result, resolve, reject);
    });
  },
});

module.exports = AsyncFromSyncIterator;
