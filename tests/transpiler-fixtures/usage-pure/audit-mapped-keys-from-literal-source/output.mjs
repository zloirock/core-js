import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// A mapped type keyed on a fixed literal key-set carries THOSE keys, not the keys of the type its
// body indexes, so a member present only in the indexed type must not resolve. The string module
// is the first row's verdict - a resolved receiver would be array-only - while the second row
// proves the real keys still resolve through the per-key expansion.
type Pair<T> = { [K in keyof {
  x: unknown;
  y: unknown;
}]: T[K] };
declare const p: Pair<{
  x: number[];
  y: number;
  extra: string;
}>;
_at(_ref = p.extra).call(_ref, 0);
_includesMaybeArray(_ref2 = p.x).call(_ref2, 1);