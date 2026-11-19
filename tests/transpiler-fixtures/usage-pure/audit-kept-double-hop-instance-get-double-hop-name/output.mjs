import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
// A DOUBLE proxy hop under a kept assignment with an instance-GET tail: the erase-refusal claim fires INSIDE outer instance
// wrappers already built over the member, so the guard must climb above the whole wrapper stack - guarding only the wrapper's
// argument would hand `void 0` to the helper (a throw where native short-circuits the chain).
let n;
export const doubleHopName = null == (n = _globalThis.window) ? void 0 : _nameMaybeFunction(_Set);