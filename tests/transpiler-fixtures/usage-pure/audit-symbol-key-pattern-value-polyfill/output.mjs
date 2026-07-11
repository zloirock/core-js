import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _Symbol$toPrimitive from "@core-js/pure/actual/symbol/to-primitive";
var _ref, _ref2;
// a symbol-keyed NESTED pattern extracts through the get-iterator-method helper: the pattern
// destructures the helper result (polyfill-visible where a raw symbol read misses native
// iterators), and polyfillable content in its VALUE position - an instance call in a binding
// default - is rewritten inside the extracted pattern. the sibling prop keeps the residual,
// where the consumed key retires to a sentinel
const obj = {};
const {
  next = _atMaybeArray(_ref2 = [1]).call(_ref2, 0)
} = _getIteratorMethod(obj);
const {
  Array: {
    from
  },
  [_Symbol$iterator]: _unused
} = obj;
// prop-level default: the helper result is guarded (`=== void 0 ? fb : _ref`), so a genuinely
// non-iterable receiver still takes the user default like a raw undefined read would
const fb = {
  done: true
};
const {
  done
} = (_ref = _getIteratorMethod(obj)) === void 0 ? fb : _ref; // rest INSIDE the extracted pattern destructures the helper result the same way; the residual
// keeps a sentinel for the consumed symbol key
const arr = [3];
const {
  name,
  ...restOfMethod
} = _getIteratorMethod(arr);
const {
  [_Symbol$iterator]: _unused2
} = arr;
// all-proxy ternary receiver: the collapse extracts the sibling static AND the symbol pattern
const {
  union
} = _Set;
const {
  next: n2
} = _getIteratorMethod(_globalThis); // a computed well-known-symbol key INSIDE the extracted pattern stays live and substitutes
const {
  [_Symbol$toPrimitive]: tp
} = _getIteratorMethod([1]); // an SE computed key and a symbol pattern SHARE one residual: both retire to sentinels there,
// the key effect runs once in place
let c = 0;
const of = _Array$of;
const {
  name: iterName2
} = _getIteratorMethod(Array);
const {
  [(c++, 'of')]: _unused3,
  [_Symbol$iterator]: _unused4
} = Array;
export { from, next, done, name, restOfMethod, union, n2, tp, of, iterName2, c };