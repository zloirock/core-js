import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// Pick on top of `as`-renamed mapped type. expandMappedTypeMembers produces
// renamed keys; STRUCTURE_PRESERVING_WRAPPERS' Pick descends to the source type
// and must look up renamed (`_items`) keys, not the original.
type Renamed<T> = { [K in keyof T as `_${K & string}`]: T[K] };
type Source = {
  items: number[];
  pages: string[];
};
declare const r: Pick<Renamed<Source>, '_items'>;
_atMaybeArray(_ref = r._items).call(_ref, 0);