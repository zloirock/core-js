import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// Two realm elements retain independent positional constructor hints while their patterns stay native.
// A later Array.from call is served through the first binding.
const [{
  Array: F
}, {
  Promise: P
}] = [_globalThis, _globalThis];
export const viaBothA = _Array$from([1]);