var bind = require('core-js-internals/bind-context');
var call = require('./_iter-call');
var isArrayIterator = require('./_is-array-iter');
var anObject = require('core-js-internals/an-object');
var toLength = require('core-js-internals/to-length');
var getIteratorMethod = require('./core.get-iterator-method');
var BREAK = {};

var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
  var iterFn = ITERATOR ? function () { return iterable; } : getIteratorMethod(iterable);
  var boundFunction = bind(fn, that, entries ? 2 : 1);
  var index = 0;
  var length, step, iterator, result;
  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if (isArrayIterator(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
    result = entries ? boundFunction(anObject(step = iterable[index])[0], step[1]) : boundFunction(iterable[index]);
    if (result === BREAK) return;
  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
    result = call(iterator, boundFunction, step.value, entries);
    if (result === BREAK) return;
  }
};
exports.BREAK = BREAK;
