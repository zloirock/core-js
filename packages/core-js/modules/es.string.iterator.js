'use strict';
var defineIterator = require('../internals/iterator-define');
var charAt = require('../internals/string-multibyte').charAt;
var toString = require('../internals/to-string');
var setInternalState = require('../internals/internal-state').set;
var internalStateGetterFor = require('../internals/internal-state-getter-for');
var normalizeIteratorMethod = require('../internals/iterator-normalize-method');
var createIteratorConstructor = require('../internals/iterator-create-constructor');
var createIterResultObject = require('../internals/create-iter-result-object');

var STRING = 'String';
var STRING_ITERATOR = STRING + ' Iterator';
var getInternalState = internalStateGetterFor(STRING_ITERATOR);

var $StringIterator = createIteratorConstructor(function StringIterator(iterated) {
  setInternalState(this, {
    type: STRING_ITERATOR,
    string: toString(iterated),
    index: 0,
  });
// `%StringIteratorPrototype%.next` method
// https://tc39.es/ecma262/#sec-%stringiteratorprototype%.next
}, STRING, function next() {
  var state = getInternalState(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length) return createIterResultObject(undefined, true);
  point = charAt(string, index);
  state.index += point.length;
  return createIterResultObject(point, false);
});

// `String.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-string.prototype-@@iterator
defineIterator(STRING, normalizeIteratorMethod(String, STRING) || function () {
  return new $StringIterator(this);
});
