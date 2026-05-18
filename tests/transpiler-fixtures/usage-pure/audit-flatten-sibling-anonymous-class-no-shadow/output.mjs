import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// anonymous class as sibling: no id means no shadow. inner method ref to `globalThis`
// MUST be substituted to `_globalThis` (regression-guard: ensures the Q10-4 fix did NOT
// over-shadow - only named classes register their id in the scope walker locals)
const from = _Array$from;
const k = class {
  m() {
    return _globalThis;
  }
};
console.log(from, k);