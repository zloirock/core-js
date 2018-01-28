'use strict';
var $at = require('./_string-at')(true);
var $ = require('./_state');

// 21.1.3.27 String.prototype[@@iterator]()
require('./_iter-define')(String, 'String', function (iterated) {
  $(this, {
    string: String(iterated),
    index: 0
  });
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function next() {
  var state = $(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length) return { value: undefined, done: true };
  point = $at(string, index);
  state.index += point.length;
  return { value: point, done: false };
});
