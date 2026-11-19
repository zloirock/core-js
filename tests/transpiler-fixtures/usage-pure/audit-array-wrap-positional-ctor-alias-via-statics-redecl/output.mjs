import _globalThis from "@core-js/pure/actual/global-this";
import _Math$cbrt from "@core-js/pure/actual/math/cbrt";
// a same-name redeclaration of STATICS-ONLY hints merges last-wins like the ctor form - the
// use folds through the last write's hint (runtime last-write-wins)
var [{
  JSON: VR
}] = [_globalThis];
var [{
  Math: VR
}] = [_globalThis];
export const viaStaticsRedecl = _Math$cbrt(value2);