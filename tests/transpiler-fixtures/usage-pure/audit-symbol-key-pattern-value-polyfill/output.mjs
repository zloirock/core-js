import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _Symbol$toPrimitive from "@core-js/pure/actual/symbol/to-primitive";
var _ref2, _ref3;
// Object-rest keeps the affected method slots native; computed symbol keys still polyfill.
// Independent reads and key/default expressions still receive their own polyfills.
const obj = {};
const _ref = obj;
const {
  Array: {
    from
  }
} = _ref;
const {
  next = _atMaybeArray(_ref2 = [1]).call(_ref2, 0)
} = _getIteratorMethod(_ref); // prop-level default: the helper result is guarded (a memoized `=== void 0` test), so a genuinely
// non-iterable receiver still takes the user default like a raw undefined read would
const fb = {
  done: true
};
const {
  done
} = (_ref3 = _getIteratorMethod(obj)) === void 0 ? fb : _ref3;
const arr = [3];
const {
  [_Symbol$iterator]: {
    name,
    ...restOfMethod
  }
} = arr;
// all-proxy ternary receiver: the collapse extracts the sibling static AND the symbol pattern
const _ref4 = _globalThis;
const {
  customQ
} = _Set;
const {
  next: n2
} = _getIteratorMethod(_ref4); // a computed well-known-symbol key INSIDE the extracted pattern stays live and substitutes
const {
  [_Symbol$toPrimitive]: tp
} = _getIteratorMethod([1]); // A computed key and iterator pattern share one receiver and execute their reads in source order.
let c = 0;
const _ref5 = Array;
const of = null == _ref5 ? _ref5[""] : (c++, _Array$of);
const iterName2 = _nameMaybeFunction(_getIteratorMethod(_ref5)); // memoize-class receivers extract through a shared `_ref` (single read): a CONST-LITERAL
// receiver with a multi-binding pattern, a MEMBER receiver (getter fires once), a BRANCHING
// receiver, and a CALL init (whole-init memo - the call runs once)
const {
  length: litArity,
  call: litCall
} = _getIteratorMethod([7]);
const _ref6 = holder.p;
const {
  length: memArity
} = _getIteratorMethod(_ref6);
const {
  sib
} = _ref6;
const _ref7 = cond ? [8] : [];
const {
  length: brArity
} = _getIteratorMethod(_ref7);
const {
  alt
} = _ref7;
const _ref8 = mk();
const {
  length: callArity
} = _getIteratorMethod(_ref8);
const {
  q
} = _ref8; // The member receiver is evaluated once before the computed-key and iterator reads.
const _ref9 = holder2.p;
const _ref10 = _ref9;
const ts = null == _ref10 ? _ref10[""] : (k2(), _toSortedMaybeArray(_ref10));
const {
  length: mixArity
} = _getIteratorMethod(_ref9); // EXPORT host: the memo plants as a bare statement before the export (never exported itself)
const _ref11 = holder3.p;
const {
  length: expArity
} = _getIteratorMethod(_ref11);
const {
  expQ
} = _ref11;
export { expArity, expQ };
export { from, next, done, name, restOfMethod, customQ, n2, tp, of, iterName2, c, litArity, litCall, memArity, sib, brArity, alt, callArity, q, ts, mixArity };