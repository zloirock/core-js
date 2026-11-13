import _globalThis from "@core-js/pure/actual/global-this";
// Keep the source guard and distinguish realm values from user properties.
const g = _globalThis;
let w;
export const r = (w = flag ? g : _globalThis).window?.Array.from([3]);