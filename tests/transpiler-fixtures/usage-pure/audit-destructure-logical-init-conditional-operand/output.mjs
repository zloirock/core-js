import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
const from = _Array$from;
// a retained logical init whose operand is a conditional (or an effect-free sequence) must polyfill
// the globals inside it - the blanket skip suppressed the natural visitor, so a raw operand leaks a
// native global (a ReferenceError on the taken fallback in older engines). a `...rest` sibling keeps
// the logical retained per-operand rather than fully consuming and dropping the fallback
const {
  from: _unused,
  ...rest
} = _globalThis.Array || (cond ? _Set : _Map);
const of = _Array$of;
const {
  of: _unused2,
  ...others
} = _globalThis.Array || (readOnlyFlag, _WeakSet);
export { from, rest, of, others };