import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _Symbol$toPrimitive from "@core-js/pure/actual/symbol/to-primitive";
var _ref, _ref2;
// Well-known-symbol patterns read the selected iterator method and retain nested defaults.
// Computed sibling keys and effectful receivers keep their order beside static and instance claims.
const obj = {};
const {
    Array: {
      from
    }
  } = obj,
  {
    next = _atMaybeArray(_ref = [1]).call(_ref, 0)
  } = _getIteratorMethod(obj);
// prop-level default: the helper result is guarded (a memoized `=== void 0` test), so a genuinely
// non-iterable receiver still takes the user default like a raw undefined read would
const fb = {
  done: true
};
const {
  done
} = (_ref2 = _getIteratorMethod(obj)) === void 0 ? fb : _ref2;
const arr = [3];
const {
  [_Symbol$iterator]: {
    name,
    ...restOfMethod
  }
} = arr;
// all-proxy ternary receiver: the collapse extracts the sibling static AND the symbol pattern
const {
  customQ
} = _Set;
const {
  next: n2
} = _getIteratorMethod(_globalThis); // a computed well-known-symbol key INSIDE the extracted pattern stays live and substitutes
const {
  [_Symbol$toPrimitive]: tp
} = _getIteratorMethod([1]); // A computed key and iterator pattern share one receiver and execute their reads in source order.
let c = 0;
const of = (c++, _Array$of);
const iterName2 = _nameMaybeFunction(_getIteratorMethod(Array)); // Each nested iterator pattern reads its receiver once: an array literal, a member,
// a conditional receiver and a call result. Sibling reads share the selected value.
const {
  length: litArity,
  call: litCall
} = _getIteratorMethod([7]);
const _ref3 = holder.p,
  {
    length: memArity
  } = _getIteratorMethod(_ref3),
  {
    sib
  } = _ref3;
const _ref4 = cond ? [8] : [],
  {
    length: brArity
  } = _getIteratorMethod(_ref4),
  {
    alt
  } = _ref4;
const _ref5 = mk(),
  {
    length: callArity
  } = _getIteratorMethod(_ref5),
  {
    q
  } = _ref5;
// The member receiver is evaluated once before the computed-key and iterator reads.
const _ref6 = holder2.p;
const ts = null == _ref6 ? _ref6[""] : (k2(), _toSortedMaybeArray(_ref6));
const {
  length: mixArity
} = _getIteratorMethod(_ref6); // Exported destructuring evaluates the receiver once and exports only the source bindings.
const _ref7 = holder3.p,
  {
    length: expArity
  } = _getIteratorMethod(_ref7),
  {
    expQ
  } = _ref7;
export { expArity, expQ };
export { from, next, done, name, restOfMethod, customQ, n2, tp, of, iterName2, c, litArity, litCall, memArity, sib, brArity, alt, callArity, q, ts, mixArity };