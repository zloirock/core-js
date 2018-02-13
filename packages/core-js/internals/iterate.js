var anObject = require('../internals/an-object');
var isArrayIteratorMethod = require('../internals/is-array-iterator-method');
var toLength = require('../internals/to-length');
var bind = require('../internals/bind-context');
var getIteratorMethod = require('../modules/core.get-iterator-method');
var callWithSafeIterationClosing = require('../internals/call-with-safe-iteration-closing');
var BREAK = {};

var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
  var iterFn = ITERATOR ? function () { return iterable; } : getIteratorMethod(iterable);
  var boundFunction = bind(fn, that, entries ? 2 : 1);
  var index = 0;
  var length, step, iterator, result;
  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if (isArrayIteratorMethod(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
    result = entries ? boundFunction(anObject(step = iterable[index])[0], step[1]) : boundFunction(iterable[index]);
    if (result === BREAK) return;
  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
    result = callWithSafeIterationClosing(iterator, boundFunction, step.value, entries);
    if (result === BREAK) return;
  }
};
exports.BREAK = BREAK;
