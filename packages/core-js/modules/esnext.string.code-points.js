'use strict';
// https://github.com/RReverser/string-prototype-codepoints
// TODO: unify with String#@@iterator
var requireObjectCoercible = require('core-js-internals/require-object-coercible');
var $ = require('./_state');
var createAt = require('./_string-at');
var codePointAt = createAt(false);
var at = createAt(true);

var StringIterator = function (string) {
  $(this, {
    string: string,
    index: 0
  });
};

require('./_iter-create')(StringIterator, 'String', function next() {
  var state = $(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length) return { value: undefined, done: true };
  point = at(string, index);
  state.index += point.length;
  return { value: codePointAt(point, 0), done: false };
});

require('./_export')({ target: 'String', proto: true }, {
  codePoints: function codePoints() {
    return new StringIterator(String(requireObjectCoercible(this)));
  }
});
