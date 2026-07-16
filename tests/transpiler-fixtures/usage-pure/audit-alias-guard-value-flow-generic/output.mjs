import _Array$from from "@core-js/pure/actual/array/from";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _Array$of from "@core-js/pure/actual/array/of";
import _at from "@core-js/pure/actual/instance/at";
import _Object$keys from "@core-js/pure/actual/object/keys";
// A conditionally-executed aliasing write assigns on one path only: the value-flow return
// resolver must refuse the (constructor, method) pair exactly like the body-extract route,
// keeping the call-result dispatch GENERIC on both emitters (a pristine-tree walk used to
// narrow it array-typed while the other emitter's post-rewrite scope stayed generic).
// guarded assignment-form write - the call result dispatches generic
let make;
if (cond) make = _Array$from;
export const r = make([1]);
export const x = _at(r).call(r, 0);
// a guarded hoisted-var declarator still EXTRACTS (polyfill always wins on the write
// itself), so the call result narrows through the polyfilled-entry route - identical on
// both emitters, unlike the refused user-flow trust above
if (cond) {
  var keys = _Object$keys;
}
export const t = keys(obj);
export const y = _mapMaybeArray(t).call(t, v => v);
// control: an UNCONDITIONAL alias keeps the typed narrow
const of = _Array$of;
export const s = of(1, 2);
export const z = _includesMaybeArray(s).call(s, 1);