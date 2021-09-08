'use strict';
var anObject = require('../internals/an-object');
var create = require('../internals/object-create');
var getMethod = require('../internals/get-method');
var redefineAll = require('../internals/redefine-all');
var InternalStateModule = require('../internals/internal-state');
var getBuiltIn = require('../internals/get-built-in');
var AsyncIteratorPrototype = require('../internals/async-iterator-prototype');

var Promise = getBuiltIn('Promise');

var setInternalState = InternalStateModule.set;
var getInternalState = InternalStateModule.get;

var asyncFromSyncIteratorContinuation = function (result, resolve, reject) {
  var done = result.done;
  Promise.resolve(result.value).then(function (value) {
    resolve({ done: done, value: value });
  }, reject);
};

var AsyncFromSyncIterator = function AsyncIterator(iterator) {
  setInternalState(this, {
    iterator: anObject(iterator),
    next: iterator.next
  });
};

AsyncFromSyncIterator.prototype = redefineAll(create(AsyncIteratorPrototype), {
  next: function next(arg) {
    var state = getInternalState(this);
    var hasArg = !!arguments.length;
    return new Promise(function (resolve, reject) {
      var result = anObject(state.next.apply(state.iterator, hasArg ? [arg] : []));
      asyncFromSyncIteratorContinuation(result, resolve, reject);
    });
  },
  'return': function (arg) {
    var iterator = getInternalState(this).iterator;
    var hasArg = !!arguments.length;
    return new Promise(function (resolve, reject) {
      var $return = getMethod(iterator['return']);
      if ($return === undefined) return resolve({ done: true, value: arg });
      var result = anObject($return.apply(iterator, hasArg ? [arg] : []));
      asyncFromSyncIteratorContinuation(result, resolve, reject);
    });
  },
  'throw': function (arg) {
    var iterator = getInternalState(this).iterator;
    var hasArg = !!arguments.length;
    return new Promise(function (resolve, reject) {
      var $throw = getMethod(iterator['throw']);
      if ($throw === undefined) return reject(arg);
      var result = anObject($throw.apply(iterator, hasArg ? [arg] : []));
      asyncFromSyncIteratorContinuation(result, resolve, reject);
    });
  }
});

module.exports = AsyncFromSyncIterator;
