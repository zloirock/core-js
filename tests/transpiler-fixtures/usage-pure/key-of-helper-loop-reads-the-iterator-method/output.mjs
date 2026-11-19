import _getIterator from "@core-js/pure/actual/get-iterator";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _isIterable from "@core-js/pure/actual/is-iterable";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// the async iterator helpers look the method up in a loop: the key holds the well-known symbol a test
// the build decides installs before the loop, then its `'@@iterator'` fallback, and the iterator method
// answers either one. so a read keyed by it is that method - tested, held, behind `in` or called -
// while the async key beside it and a write keyed by it keep the alias
function _asyncIterator(r) {
  var n,
    t,
    o,
    e = 2;
  for (t = _Symbol$asyncIterator, o = _Symbol$iterator; e--;) {
    if (t && null != (n = r[t])) return n.call(r);
    if (o && null != (n = _getIteratorMethod(r))) return n.call(r);
    t = "@@asyncIterator", o = "@@iterator";
  }
  throw new TypeError("Object is not async iterable");
}
export const lookup = _asyncIterator;
export function positions(r) {
  var k,
    e = 2;
  for (k = _Symbol$iterator; e--;) {
    var held = _getIteratorMethod(r);
    if (_isIterable(r)) return _getIterator(r);
    r[k] = held;
    k = "@@iterator";
  }
}