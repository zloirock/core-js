import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// An array-wrapped constructor alias retains its static-method type.
// Later calls use their dedicated pure entries even when the constructor entry omits them.
const [{
  Array: A
}, tail] = [_globalThis, 0];
const [{
  Map: M
}] = [{
  Map: _Map
}];
export const r = [_Array$from([1, 2, 3]), typeof _Map$groupBy];
export const effects = tail;