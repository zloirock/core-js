import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// indexed-access type `Cfg['items']['data']` should resolve to `string[]` so `x.at(0)`
// picks the array-specific polyfill. resolution walks the nested lookups key-by-key
type Cfg = {
  items: {
    data: string[];
  };
};
declare const x: Cfg['items']['data'];
_atMaybeArray(x).call(x, 0);