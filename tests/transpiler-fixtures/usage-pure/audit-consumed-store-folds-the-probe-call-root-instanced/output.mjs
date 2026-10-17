import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// Plain reads through a stored realm run retain the consuming collapse, including destructuring after its render.
// An optional continuation preserves the absence of a terminal window probe instead of proving it defined.
// Identifier and proven-call roots keep every sequence and computed-key effect exactly once.
let e = 0;
let held;
function dh() {
  return _globalThis;
}
export const callRootInstanced = _nameMaybeFunction(_atMaybeArray((held = (e++, _self)).Array.prototype));
export { e };
export { held };