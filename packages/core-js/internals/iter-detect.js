var ITERATOR = require('../internals/well-known-symbol')('iterator');
var SAFE_CLOSING = false;

try {
  var iteratorWithReturn = [7][ITERATOR]();
  iteratorWithReturn['return'] = function () { SAFE_CLOSING = true; };
  // eslint-disable-next-line no-throw-literal
  Array.from(iteratorWithReturn, function () { throw 2; });
} catch (e) { /* empty */ }

module.exports = function (exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;
  try {
    var array = [7];
    var iterator = array[ITERATOR]();
    iterator.next = function () { return { done: safe = true }; };
    array[ITERATOR] = function () { return iterator; };
    exec(array);
  } catch (e) { /* empty */ }
  return safe;
};
