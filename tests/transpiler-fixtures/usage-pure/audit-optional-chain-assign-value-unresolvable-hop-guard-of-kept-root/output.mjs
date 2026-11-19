import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// the DESTRUCTURE-source shape of the same kept root: however an emitter renders the root, it
// must swap the kept value's OWN raw root and nothing else, or the assignment leaks an
// unpolyfilled `globalThis`
let d;
export const ofKeptRoot = ((d = _globalThis.window).self, _Array$of);