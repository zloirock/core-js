// nested proxy-global destructure `const {window: {Array}} = globalThis` must walk
// through proxy-global keys (`window`, `self`, ...) so the leaf `Array` binding still
// registers as the global; otherwise downstream `Array.from(...)` loses its narrow
const { window: { Array } } = globalThis;
const arr = Array.from([1, 2, 3]);
const head = arr.at(0);
export { head };
