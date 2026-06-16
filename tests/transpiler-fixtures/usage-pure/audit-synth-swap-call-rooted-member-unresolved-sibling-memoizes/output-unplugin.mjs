import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// same memoization, with the side effect at the chain ROOT instead of buried along the spine: a
// member default rooted at a side-effecting IIFE plus an UNRESOLVED sibling key. the IIFE is the
// memo argument (run once); the unresolved key reads the memo rather than re-running the IIFE
function f({ from, isArray } = (function (_ref) { return { from: _Array$from, isArray: _ref.isArray }; })((() => {
  _globalThis.c++;
  return _globalThis;
})().Array)) {
  return [from([1]), isArray([])];
}
f();