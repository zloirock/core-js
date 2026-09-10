import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _self from "@core-js/pure/actual/self";
// the same probe hop with a POLYFILLABLE ctor as its leaf. the test asks whether the environment's
// `window` carries `Promise`, so the read stays what the source wrote: the leaf claim re-visited
// INSIDE the guard-test clone stands down, and the realm hops below it spell their own ponyfill -
// swapped in, the test read an always-defined binding and answered the branch native short-circuits
// past, calling `resolve` on a realm with no `window` at all
let p;
export const storedProbeCtor = null == (p = _self.window?.Promise) ? void 0 : _Promise$resolve(1);
export { p };