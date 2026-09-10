import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// an alias holds a value the VALUE canon calls absent-able through an inline CALL - a source the
// hop-based alias walk cannot see, since the held nav has no unbacked hop of its own. the read is
// visited BEFORE the declarator is rendered, so the alias arm is the only thing that can answer,
// and the `?.` over the store stays load-bearing: erased, the claim runs where the source
// short-circuits. observable as TEXT and at runtime, never as an import set
export function read() {
  return null == (q = w?.Array) ? void 0 : _Array$from([1]);
}
let q;
function dw() {
  return _globalThis.window;
}
const w = null == dw() ? void 0 : _self;

// NEGATIVE: a call yielding the always-defined root leaves nothing for the alias to hold absent
function dg() {
  return _globalThis;
}
const g = _self;
export const defined = _Array$from([2]);
export { g, q, w };