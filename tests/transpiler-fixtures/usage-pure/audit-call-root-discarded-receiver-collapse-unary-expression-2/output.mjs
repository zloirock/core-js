import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
let z = 0;
function nf() {
  z++;
  return _globalThis;
}
nf(), z++;
const asyncIterator = _Symbol$asyncIterator;
export const i = [typeof asyncIterator, z];