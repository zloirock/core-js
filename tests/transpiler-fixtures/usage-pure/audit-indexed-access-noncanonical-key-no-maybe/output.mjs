import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// A non-canonical string index (`T["1.0"]`, `T[""]`, `T["01"]`) is NOT an array slot - it addresses a
// missing object key, so the indexed access is undefined, not the coerced element. The resolver must reject
// it (round-trip `String(n) === key`) and fall back to the generic helper, instead of `Number("1.0")=1`
// mis-reading element 1 (string[]) and emitting a type-specific `_atMaybeArray`. The canonical `T["1"]`
// still resolves to element 1 (string[]) -> `_includesMaybeArray`
declare function pickBad<T extends [string, string[]]>(t: T): T["1.0"];
declare function pickGood<T extends [string, string[]]>(t: T): T["1"];
const tup: [string, string[]] = ["x", ["y"]];
_at(_ref = pickBad(tup)).call(_ref, 0);
_includesMaybeArray(_ref2 = pickGood(tup)).call(_ref2, "z");