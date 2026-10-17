import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
let n = 0;
function pf() {
  n++;
  return _globalThis;
}
pf();
const resolve = _Promise$resolve;
export const p = [typeof resolve, n];