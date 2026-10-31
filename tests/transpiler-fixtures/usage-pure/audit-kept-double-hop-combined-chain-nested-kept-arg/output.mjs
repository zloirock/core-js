import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
var _ref;
// a SECOND kept chain nested in the claim's ARGUMENT keeps its own guard and claims - the
// composed needle carries the nested chain's live `?.` (only the outer chain's hops deopt)
let a;
let b;
export const nestedKeptArg = null == (a = _globalThis.window) ? void 0 : _flatMaybeArray(_ref = _Array$of(null == (b = _globalThis.window) ? void 0 : _nameMaybeFunction(_Set)))?.call(_ref);