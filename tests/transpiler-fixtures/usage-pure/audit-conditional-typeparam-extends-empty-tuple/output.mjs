import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// `T extends [] ? Promise : T` - empty tuple as extendsType. both `[]` and the check side
// `[number, number]` collapse to an Array type sharing the same constructor, so they look
// equal until inner element types compare. a concrete empty tuple (not bare shorthand) with a
// non-empty check inner is structurally disjoint, so the conditional must deterministically pick
// the false branch -> T = number[] -> narrow Array dispatch, not a heterogeneous fold to Object
type Wrap<T> = T extends [] ? Promise<number> : T;
declare const r: Wrap<[number, number]>;
_atMaybeArray(r).call(r, 0);
_includesMaybeArray(r).call(r, 1);