import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
// per-branch synth on a conditional default whose taken branch is a member chain rooted at a
// side-effecting IIFE, with an UNRESOLVED sibling key: the branch is memoized through a function
// param (run once) exactly as the non-conditional receiver is, so the IIFE setup is not re-run by
// the unresolved key's re-read. both emitters thread the shared classifier's memoize flag here
function f(cond, { from, isArray } = cond ? (function (_ref) { return { from: _Array$from, isArray: _ref.isArray }; })((() => {
  _globalThis.c++;
  return _globalThis;
})().Array) : _Set) {
  return [from([1]), isArray([])];
}
f(true);