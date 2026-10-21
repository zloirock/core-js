import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _entries from "@core-js/pure/actual/instance/entries";
// Nested patterns retain effectful realm reads and independent claims inside their keys.
let c = 0;
const {
  Symbol: {
    iterator
  }
} = _globalThis[c++, 'self'];
export const r1 = [typeof iterator, c];
let d = 0;
const {
  Promise: {
    resolve
  },
  other
} = _globalThis[d++, 'self'];
export const r2 = [typeof resolve, typeof other, d];
let a;
const {
  Map: {
    groupBy
  }
} = _globalThis[a = _Array$of(3), 'self'];
export const r3 = [typeof groupBy, a.length];
let k = 0;
function mk() {
  k++;
  return _globalThis;
}
const entries = _entries(mk()[k++, 'self'].Object);
export const r4 = [typeof entries, k];