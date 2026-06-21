import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// paren-wrapped optional member with non-call sequel: `(arr?.at).length` and
// `(arr?.flat).name`. parent is MemberExpression (not CallExpression), so neither the
// paren-lookup-only nor the call branch fires. should fall to the bare lookup branch
// `_at(arr).length` etc. distinct methods/property accesses per line for visibility
const a = (arr == null ? void 0 : _at(arr)).length;
const b = _nameMaybeFunction(arr == null ? void 0 : _flatMaybeArray(arr));
const c = (arr == null ? void 0 : _includes(arr)).bind;
export { a, b, c };