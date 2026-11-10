import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
// The supplied argument and the parameter default keep their own evaluation slots.
export const effects = [];
export const r = (() => {
  return function ({} = Object) {
    let P = _Promise;
    return [typeof P, arguments[0] === _globalThis];
  }(_globalThis);
})();