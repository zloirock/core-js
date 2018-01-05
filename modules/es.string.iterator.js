'use strict';
var $at = require('./_string-at')(true);
var $ = require('./_state');

// 21.1.3.27 String.prototype[@@iterator]()
require('./_iter-define')(String, 'String', function (iterated) {
  $(this, {
    target: String(iterated),
    index: 0
  });
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function () {
  var state = $(this);
  var target = state.target;
  var index = state.index;
  var point;
  if (index >= target.length) return { value: undefined, done: true };
  point = $at(target, index);
  state.index += point.length;
  return { value: point, done: false };
});
