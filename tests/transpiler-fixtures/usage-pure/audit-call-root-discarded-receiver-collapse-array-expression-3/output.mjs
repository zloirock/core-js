import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
let k = 0;
function af() {
  k++;
  return _globalThis;
}
af(), k++;
const from = _Array$from;
export const a = [typeof from, k];