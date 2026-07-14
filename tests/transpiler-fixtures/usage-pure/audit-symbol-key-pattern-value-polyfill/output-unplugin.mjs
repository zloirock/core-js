import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _Array$of from "@core-js/pure/actual/array/of";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _Symbol$toPrimitive from "@core-js/pure/actual/symbol/to-primitive";
var _ref, _ref8;
// a symbol-keyed NESTED pattern extracts through the get-iterator-method helper: the pattern
// destructures the helper result (polyfill-visible where a raw symbol read misses native
// iterators), and polyfillable content in its VALUE position - an instance call in a binding
// default - is rewritten inside the extracted pattern. the sibling prop keeps the residual,
// where the consumed key retires to a sentinel
const obj = {};
const { next = _atMaybeArray(_ref = [1]).call(_ref, 0) } = _getIteratorMethod(obj);
const { Array: { from }, [_Symbol$iterator]: _unused9 } = obj;
// prop-level default: the helper result is guarded (`=== void 0 ? fb : _ref`), so a genuinely
// non-iterable receiver still takes the user default like a raw undefined read would
const fb = { done: true };
const { done } = (_ref8 = _getIteratorMethod(obj)) === void 0 ? fb : _ref8;
// rest INSIDE the extracted pattern destructures the helper result the same way; the residual
// keeps a sentinel for the consumed symbol key
const arr = [3];
const { name, ...restOfMethod } = _getIteratorMethod(arr);
const { [_Symbol$iterator]: _unused10 } = arr;
// all-proxy ternary receiver: the collapse extracts the sibling static AND the symbol pattern
const { union } = _Set;
const { next: n2 } = _getIteratorMethod(_globalThis);
// a computed well-known-symbol key INSIDE the extracted pattern stays live and substitutes
const { [_Symbol$toPrimitive]: tp } = _getIteratorMethod([1]);
// an SE computed key and a symbol pattern SHARE one residual: both retire to sentinels there,
// the key effect runs once in place
let c = 0;
const of = _Array$of;
const { name: iterName2 } = _getIteratorMethod(Array);
const { [(c++, 'of')]: _unused, [_Symbol$iterator]: _unused11 } = Array;
// memoize-class receivers extract through a shared `_ref` (single read): a CONST-LITERAL
// receiver with a multi-binding pattern, a MEMBER receiver (getter fires once), a BRANCHING
// receiver, and a CALL init (whole-init memo - the call runs once)
const _ref2 = [7];
const { length: litArity, call: litCall } = _getIteratorMethod(_ref2);
const { [_Symbol$iterator]: _unused3 } = _ref2;
const _ref3 = holder.p;
const { length: memArity } = _getIteratorMethod(_ref3);
const { [_Symbol$iterator]: _unused4, sib } = _ref3;
const _ref4 = cond ? [8] : [];
const { length: brArity } = _getIteratorMethod(_ref4);
const { [_Symbol$iterator]: _unused5, alt } = _ref4;
const _ref5 = mk();
const { length: callArity } = _getIteratorMethod(_ref5);
const { [_Symbol$iterator]: _unused6, q } = _ref5;
// an SE computed key AND a symbol pattern on ONE memoized receiver share the `_ref`: the
// member read fires once, both extractions and both sentinels read the memo
const _ref6 = holder2.p;
const ts = _toSortedMaybeArray(_ref6);
const { length: mixArity } = _getIteratorMethod(_ref6);
const { [(k2(), 'toSorted')]: _unused2, [_Symbol$iterator]: _unused7 } = _ref6;
// EXPORT host: the memo plants as a bare statement before the export (never exported itself)
const _ref7 = holder3.p;
export const { length: expArity } = _getIteratorMethod(_ref7);
export const { [_Symbol$iterator]: _unused8, expQ } = _ref7;
export { from, next, done, name, restOfMethod, union, n2, tp, of, iterName2, c, litArity, litCall, memArity, sib, brArity, alt, callArity, q, ts, mixArity };