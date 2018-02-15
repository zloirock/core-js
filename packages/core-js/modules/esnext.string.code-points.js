'use strict';
// https://github.com/RReverser/string-prototype-codepoints
// TODO: unify with String#@@iterator
var createIteratorConstructor = require('../internals/create-iterator-constructor');
var requireObjectCoercible = require('../internals/require-object-coercible');
var $ = require('../internals/state');
var createAt = require('../internals/string-at');
var codePointAt = createAt(false);
var at = createAt(true);

var $StringIterator = createIteratorConstructor(function StringIterator(string) {
  $(this, {
    string: string,
    index: 0
  });
}, 'String', function next() {
  var state = $(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length) return { value: undefined, done: true };
  point = at(string, index);
  state.index += point.length;
  return { value: codePointAt(point, 0), done: false };
});

require('../internals/export')({ target: 'String', proto: true }, {
  codePoints: function codePoints() {
    return new $StringIterator(String(requireObjectCoercible(this)));
  }
});
