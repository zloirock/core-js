import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// A static claim inside a realm key remains live when a for initializer keeps its source receiver.
let a;
let out3;
for (const {
  iterator
} = _globalThis[a = _Array$of(2), 'self'].Symbol; !out3;) {
  out3 = typeof iterator;
}
export const r3 = [out3, a.length];