import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref, _ref2;
// Getter `get list(): number[]` vs method `next(): number[]` - both declare the
// same return type, but `i.list` is a property access (yielding `number[]`) and
// `i.next()` is a call (also yielding `number[]`). Both `.at(-1)` sites get the
// array-specific polyfill.
interface Iter {
  get list(): number[];
  next(): number[];
}
declare const i: Iter;
_atMaybeArray(_ref = i.list).call(_ref, -1);
_atMaybeArray(_ref2 = i.next()).call(_ref2, -1);