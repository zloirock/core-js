import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// SE-bearing IIFE under a member hop (`[(IIFE)().Array]`): same harvest contract - the
// re-emitted setup keeps its inner globalThis rewrite + import
let calls = 0;
const from = ((() => {
  calls++;
  return _globalThis;
})(), _Array$from);