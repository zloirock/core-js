import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
// `for (const [k, v] of map)` - iteration element is [K, V] tuple. `extractElementAnnotation`
// synthesizes TSTupleType for Map/ReadonlyMap so `findTupleElement` picks up K for `k`
// (-> string -> `_atMaybeString`) and V for `v` (-> number -> `_toFixedMaybeNumber`)
declare const m: Map<string, number>;
for (const [k, v] of m) {
  _atMaybeString(k).call(k, 0);
  _toFixedMaybeNumber(v).call(v, 2);
}