import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// namespace-qualified extends with type-args: `interface S extends NS.Box<number[]>`.
// generic substitution applies through the resolved parent declaration so methods
// on `value` field narrow to the array variant
namespace NS { export interface Box<T> { value: T } }
interface S extends NS.Box<number[]> {}
declare const s: S;
_includesMaybeArray(_ref = s.value).call(_ref, 1);