import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _at from "@core-js/pure/actual/instance/at";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a `var` a decided presence test declares in the arm it always takes holds that value on every
// path - with or without a block, whichever arm comes first, a key or a constructor alike - so its
// reads claim through it. an undecided pair of arms holds whichever ran, so its read stays native
if (typeof _Symbol != 'undefined') var guarded = 'at';
export const first = list => _at(list).call(list, 0);
if (typeof _Promise != 'undefined') var Ctor = _Promise;
export const resolved = () => _Promise$resolve(1);
if (typeof _Symbol === 'function') {
  var ITER = _Symbol$iterator;
} else {
  var ITER = '@@iterator';
}
export function getIter(o) {
  return _getIteratorMethod(o);
}
if (typeof _Symbol == 'undefined') var LATE = '@@iterator';else var LATE = _Symbol$iterator;
export const readLate = o => _getIteratorMethod(o);
if (flag) var either = 'of';else var either = 'from';
export const pick = list => Array[either](list);