import _self from "@core-js/pure/actual/self";
// An excluded realm root keeps its terminal environment-probe guard, including
// through a stored root. Optionals over backed values remain redundant, and plain
// navigation through the run follows the ordinary collapse rule.
let q;
function dh() {
  return globalThis;
}
export const guardedTail = _self.window?.name;
export const guardedHop = _self.name;
export const guardedBoth = _self.window?.name;
export const guardedDeep = _self.name;
export const guardedOverStore = (q = globalThis, _self).window?.name;
export const guardedOverParenStore = (q = globalThis, _self).window?.name;

// a CALL root yielding the excluded root still yields the realm - the data subset carries `globalThis` - and
// its run lands whole on the ponyfill, so its `window` hop below `self` is the realm itself and the guard folds
export const guardedCallRoot = _self.name;
export { q };