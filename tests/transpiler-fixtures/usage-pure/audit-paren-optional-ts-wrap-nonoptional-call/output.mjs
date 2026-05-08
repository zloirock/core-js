import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// paren-wrapped optional member with TS wrapper followed by NON-optional outer call:
// `((arr?.includes) as any)(1)` and `((arr?.at) as any)(0)`. native semantics: nullish
// arr -> chain ends at inner `?.` -> outer `()` invokes void 0 which TypeError throws.
// expectation: paren-lookup-only rewrite should preserve throw-on-nullish for both lines.
// distinct methods (includes vs at vs flat) per line for observable per-line dispatch
const a = (arr == null ? void 0 : _includes(arr)).call(arr, 1);
const b = (arr == null ? void 0 : _at(arr)).call(arr, 0);
const c = (arr == null ? void 0 : _flatMaybeArray(arr)).call(arr);
export { a, b, c };