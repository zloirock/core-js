import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
const from = _Array$from;
// flatten sibling has globalThis reference inside a deeply nested IIFE chain. each IIFE
// pushes a function scope. polyfillSiblingReceiverRefs walks recursively, so the
// inner `globalThis` reference must reach the polyfilled binding through all wrapper
// layers (no shadowing exists)
const info = (() => {
  return function outer() {
    return (() => {
      return _globalThis;
    })();
  }();
})();
export { from, info };