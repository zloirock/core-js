import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a logical selection over a presence test the build always answers yields one operand on every path:
// `&&` its right where the test always holds - the shape tslib's `__values` and React's iterator lookup
// spell - and `||` its right where the test always fails. the key is that operand, aliased or spelled in
// the member, and a string selection names the method it claims. an undecided test, and one `&&` always
// fails on, leave the read native
export function __values(o) {
  var s = _Symbol$iterator,
    m = s && _getIteratorMethod(o),
    i = 0;
  if (m) return m.call(o);
  if (o && typeof o.length === "number") return {
    next: function () {
      if (o && i >= o.length) o = void 0;
      return {
        value: o && o[i++],
        done: !o
      };
    }
  };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
const MAYBE_ITERATOR_SYMBOL = _Symbol$iterator;
export const readMaybe = maybeIterable => _getIteratorMethod(maybeIterable);
export const readDirect = receiver => _getIteratorMethod(receiver);
const deadTest = _Symbol$iterator;
export const readDeadTest = receiver => _getIteratorMethod(receiver);
const methodName = 'findLast';
export const findLast = (list, fn) => _findLastMaybeArray(list).call(list, fn);
const undecided = flag && _Symbol$iterator;
export const readUndecided = receiver => receiver[undecided];
const alwaysFalse = false;
export const readAlwaysFalse = receiver => receiver[alwaysFalse];