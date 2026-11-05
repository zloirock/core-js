import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
// A defined deeply nested realm element makes its receiver default dead.
// The pattern remains native while the later Iterator use retains its constructor claim.
let deepFb = {};
const [[{
  Iterator: I
} = deepFb]] = [[_globalThis]];
export const viaDeepDeadDefault = _Iterator.range(0, 3);