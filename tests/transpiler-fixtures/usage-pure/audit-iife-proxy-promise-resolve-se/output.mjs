import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// IIFE-rooted proxy chain producing a static method (Promise.resolve). the receiver ctor is a
// bare-polyfilled global, so its proxy-static rewrite would overlap the outer collapse without the
// subsumption fix; the IIFE setup still survives
let calls = 0;
const p = ((() => {
  calls++;
  return _globalThis;
})(), _Promise$resolve)(1);