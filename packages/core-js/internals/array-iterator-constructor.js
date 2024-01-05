'use strict';
var toObject = require('../internals/to-object');
var setInternalState = require('../internals/internal-state').set;
var internalStateGetterFor = require('../internals/internal-state-getter-for');
var createIteratorConstructor = require('../internals/iterator-create-constructor');
var createIterResultObject = require('../internals/create-iter-result-object');

var ARRAY_ITERATOR = 'Array Iterator';
var getInternalState = internalStateGetterFor(ARRAY_ITERATOR);

// `CreateArrayIterator` internal method
// https://tc39.es/ecma262/#sec-createarrayiterator
module.exports = createIteratorConstructor(function ArrayIterator(iterated, kind) {
  setInternalState(this, {
    type: ARRAY_ITERATOR,
    target: toObject(iterated), // target
    index: 0,                   // next index
    kind: kind,                 // kind
  });
// `%ArrayIteratorPrototype%.next` method
// https://tc39.es/ecma262/#sec-%arrayiteratorprototype%.next
}, 'Array', function () {
  var state = getInternalState(this);
  var target = state.target;
  var index = state.index++;
  if (!target || index >= target.length) {
    state.target = null;
    return createIterResultObject(undefined, true);
  }
  switch (state.kind) {
    case 'keys': return createIterResultObject(index, false);
    case 'values': return createIterResultObject(target[index], false);
  } return createIterResultObject([index, target[index]], false);
});
