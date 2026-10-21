import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
const [{
  Array: A
}, tail] = [_globalThis, 0];
const [{
  Map: M
}] = [_globalThis];
export const r = [_Array$from([1, 2, 3]), typeof _Map$groupBy];
export const effects = tail;