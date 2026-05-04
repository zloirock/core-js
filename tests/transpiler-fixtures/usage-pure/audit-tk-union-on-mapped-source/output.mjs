import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// `T[K1 | K2]` indexed access with union K. resolveIndexedAccessType folds each
// branch through this resolver; verify it integrates with mapped-type rename
// expansion when looking up renamed keys.
type Renamed<T> = { [K in keyof T as `_${K & string}`]: T[K] };
type Source = {
  items: number[];
  tags: string[];
};
declare const v: Renamed<Source>['_items' | '_tags'];
_flatMaybeArray(v).call(v);