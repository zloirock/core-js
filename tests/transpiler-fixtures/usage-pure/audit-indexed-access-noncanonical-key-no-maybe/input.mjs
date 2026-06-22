// A non-canonical string index (`T["1.0"]`, `T[""]`, `T["01"]`) is NOT an array slot - it addresses a
// missing object key, so the indexed access is undefined, not the coerced element. The resolver must reject
// it (round-trip `String(n) === key`) and fall back to the generic helper, instead of `Number("1.0")=1`
// mis-reading element 1 (string[]) and emitting a type-specific `_atMaybeArray`. The canonical `T["1"]`
// still resolves to element 1 (string[]) -> `_includesMaybeArray`
declare function pickBad<T extends [string, string[]]>(t: T): T["1.0"];
declare function pickGood<T extends [string, string[]]>(t: T): T["1"];
const tup: [string, string[]] = ["x", ["y"]];
pickBad(tup).at(0);
pickGood(tup).includes("z");
