import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// A pure static call inside a retained realm key remains independently polyfilled.
let a1;
const {
  iterator
} = _globalThis[a1 = _Array$of(1), 'self'].Symbol;
export const r1 = [typeof iterator, a1.length];