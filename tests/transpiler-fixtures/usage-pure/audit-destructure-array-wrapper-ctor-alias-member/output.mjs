import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// A native array-wrapped constructor extraction still supplies a type hint for later static reads.
// Array.from and Map.groupBy calls use their dedicated pure entries.
const [{
  Array: A
}, tail] = [_globalThis, 0];
const [{
  Map: M
}] = [_globalThis];
export const r = [_Array$from([1, 2, 3]), typeof _Map$groupBy];
export const effects = tail;