import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// nested object destructure (no array wrapper) from an SE-bearing IIFE host: the nested
// resolver classifies through the inline call and the flatten re-emits the harvested setup
let calls = 0;
const from = ((() => {
  calls++;
  return _globalThis;
})(), _Array$from);