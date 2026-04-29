import _globalThis from "@core-js/pure/actual/global-this";
import _Array$from from "@core-js/pure/actual/array/from";
// top-level destructure `{ Array } = globalThis` aliases the Array global; subsequent
// `.from(...)` on the alias must route through the polyfill.
const {
  Array: MyArr
} = _globalThis;
_Array$from([1, 2, 3]);