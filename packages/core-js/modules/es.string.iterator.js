'use strict';
var at = require('./_string-at')(true);
var $ = require('./_state');

// `String.prototype[@@iterator]` method
// https://tc39.github.io/ecma262/#sec-string.prototype-@@iterator
require('./_iter-define')(String, 'String', function (iterated) {
  $(this, {
    string: String(iterated),
    index: 0
  });
// `%StringIteratorPrototype%.next` method
// https://tc39.github.io/ecma262/#sec-%stringiteratorprototype%.next
}, function next() {
  var state = $(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length) return { value: undefined, done: true };
  point = at(string, index);
  state.index += point.length;
  return { value: point, done: false };
});
