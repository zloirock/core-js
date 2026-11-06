import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref, _ref2;
// Mapped over a source with numeric keys (`0`, `1`) must produce members lookable by numeric index.
// Synthesised member keys carry numeric strings; per-key matching has to accept them at lookup time.
type Tag<T> = { [K in keyof T as K]: T[K] };
declare const r: Tag<{
  0: number[];
  1: string[];
}>;
_atMaybeArray(_ref = r[0]).call(_ref, 0);
_atMaybeArray(_ref2 = r[1]).call(_ref2, 0);