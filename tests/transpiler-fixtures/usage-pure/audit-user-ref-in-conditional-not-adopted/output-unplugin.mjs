import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
var _ref2;
// user writes an undeclared `_ref` as a direct ternary branch and as a chained assignment RHS.
// the plugin only emits its own `_ref` memos inside `null == (...)` tests or call arguments,
// never in these positions, so it must RESERVE the user's `_ref` (allocate its own memo as
// `_ref2`) rather than adopt the name and rehydrate a `var _ref;` the user never wrote
const a = cond ? (_ref = compute()) : fallback();
const b = obj == null ? void 0 : _flatMaybeArray(_ref2 = _at(obj).call(obj, 0)).call(_ref2);