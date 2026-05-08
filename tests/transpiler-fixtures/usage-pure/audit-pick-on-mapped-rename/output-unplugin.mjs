import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// `Pick<Renamed<Source>, '_items'>` looks up the renamed key, not the original `items`.
// Pick must descend into the renamed source so the array narrow on `r._items` survives.
type Renamed<T> = { [K in keyof T as `_${K & string}`]: T[K] };
type Source = { items: number[]; pages: string[] };
declare const r: Pick<Renamed<Source>, '_items'>;
_atMaybeArray(_ref = r._items).call(_ref, 0);