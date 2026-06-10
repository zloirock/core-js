import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// SE-bearing IIFE as the proxy-global HOST of a nested destructure (`[{ Array: { from } }]`):
// harvested the same way through the array-wrapper descent
let calls = 0;
const from = ((() => {
  calls++;
  return _globalThis;
})(), _Array$from);