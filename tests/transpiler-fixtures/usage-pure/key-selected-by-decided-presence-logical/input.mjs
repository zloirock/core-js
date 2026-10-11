// a logical selection over a presence test the build always answers yields one operand on every path:
// `&&` its right where the test always holds - the shape tslib's `__values` and React's iterator lookup
// spell - and `||` its right where the test always fails. the key is that operand, aliased or spelled in
// the member, and a string selection names the method it claims. an undecided test, and one `&&` always
// fails on, leave the read native
export function __values(o) {
  var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
  if (m) return m.call(o);
  if (o && typeof o.length === "number") return {
    next: function () {
      if (o && i >= o.length) o = void 0;
      return { value: o && o[i++], done: !o };
    }
  };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
const MAYBE_ITERATOR_SYMBOL = typeof Symbol !== 'undefined' && Symbol.iterator;
export const readMaybe = maybeIterable => maybeIterable[MAYBE_ITERATOR_SYMBOL];
export const readDirect = receiver => receiver[typeof Symbol === 'function' && Symbol.iterator];
const deadTest = typeof Symbol == 'undefined' || Symbol.iterator;
export const readDeadTest = receiver => receiver[deadTest];
const methodName = 'function' == typeof Symbol && 'findLast';
export const findLast = (list, fn) => list[methodName](fn);
const undecided = flag && Symbol.iterator;
export const readUndecided = receiver => receiver[undecided];
const alwaysFalse = typeof Symbol === 'undefined' && Symbol.iterator;
export const readAlwaysFalse = receiver => receiver[alwaysFalse];
