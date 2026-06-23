import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3;
// `delete Array.from; Array.from?.(...)` deletes a static whose substitution then bails (usage-pure keeps
// the native member to honor the patch), so the optional `?.` MUST survive - dropping it would call the
// deleted slot unconditionally (throws) where the native chain short-circuits to undefined. an UNMUTATED
// `Array.of?.(...)` still deopts (drops the guard, substitutes the always-defined import), proving the
// guard is kept only for the mutated slot. a downstream polyfilled `.at()` / `.includes()` drives the
// call-split that exposed the dropped guard.
delete Array.from;
const r1 = null == (_ref = Array.from) ? void 0 : _at(_ref2 = _ref.call(Array, [1])).call(_ref2, 0);
const r2 = _includesMaybeArray(_ref3 = _Array$of(1, 2)).call(_ref3, 2);
export { r1, r2 };