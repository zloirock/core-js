import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set";
import _WeakMap from "@core-js/pure/actual/weak-map";
// a realm hop the pure build cannot back (`window`) read ahead of the one write of its slot - the `delete` below - is
// the realm there, so it folds onto the realm under it as its install-free twin does: through a call root, under a
// store a static read dereferences and as a destructured alias, declared or assigned
let q, v;
export const throughCall = _globalThis.Array;
export const stored = (q = _self, _WeakMap);
const {
  window: w
} = (() => _globalThis)();
export const lifted = _Map;
({
  window: v
} = (() => _globalThis)());
export const assigned = _Set;
export { q };
delete _globalThis.window;