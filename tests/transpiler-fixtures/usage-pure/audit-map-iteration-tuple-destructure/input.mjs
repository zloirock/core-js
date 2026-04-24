// `for (const [k, v] of map)` - iteration element is [K, V] tuple. `extractElementAnnotation`
// synthesizes TSTupleType for Map/ReadonlyMap so `findTupleElement` picks up K for `k`
// (-> string -> `_atMaybeString`) and V for `v` (-> number -> `_toFixedMaybeNumber`)
declare const m: Map<string, number>;
for (const [k, v] of m) {
  k.at(0);
  v.toFixed(2);
}
