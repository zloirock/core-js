import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// Sibling expression nests `globalThis` deep inside an IIFE chain with no shadowing.
// Receiver-ref rewrite must recurse through all wrapper layers so the inner reference resolves correctly.
const from = _Array$from;
const info = (() => {
  return function outer() {
    return (() => {
      return _globalThis;
    })();
  }();
})();
export { from, info };