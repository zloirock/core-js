import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
// an install under a presence test the build decides never runs in its own function either, wherever and
// however often the function is called, so every read of the slot takes the pure import
function polyfill() {
  if (typeof _Promise == 'undefined') _globalThis.Promise = PromiseShim;
}
polyfill();
export const settled = _Promise$allSettled([]);