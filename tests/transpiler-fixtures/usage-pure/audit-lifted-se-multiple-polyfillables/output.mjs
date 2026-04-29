import _Array$from from "@core-js/pure/actual/array/from";
import _Set from "@core-js/pure/actual/set/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
// SE prefix with multiple polyfillable references: `(new Set(arr), new Map(), globalThis)`.
// each inner reference (`Set`, `Map`) needs its own polyfill emission - the lift mechanism
// preserves the SE expressions and natural visitor pass picks up each global usage
const arr = [1, 2];
new _Set(arr), new _Map();
const from = _Array$from;
export { from };