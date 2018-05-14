'use strict';
var createIteratorConstructor = require('../internals/create-iterator-constructor');
var requireObjectCoercible = require('../internals/require-object-coercible');
var InternalStateModule = require('../internals/internal-state');
var createAt = require('../internals/string-at');
var STRING_ITERATOR = 'String Iterator';
var setInternalState = InternalStateModule.set;
var getInternalState = InternalStateModule.getterFor(STRING_ITERATOR);
var codePointAt = createAt(false);
var at = createAt(true);

// TODO: unify with String#@@iterator
var $StringIterator = createIteratorConstructor(function StringIterator(string) {
  setInternalState(this, {
    type: STRING_ITERATOR,
    string: string,
    index: 0
  });
}, 'String', function next() {
  var state = getInternalState(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length) return { value: undefined, done: true };
  point = at(string, index);
  state.index += point.length;
  return { value: { codePoint: codePointAt(point, 0), position: index }, done: false };
});

// `String.prototype.codePoints` method
// https://github.com/RReverser/string-prototype-codepoints
require('../internals/export')({ target: 'String', proto: true }, {
  codePoints: function codePoints() {
    return new $StringIterator(String(requireObjectCoercible(this)));
  }
});
