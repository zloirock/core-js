import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Set from "@core-js/pure/actual/set";
// a STORE whose value carries a `?.` of its own, read through a guard: the render lowers the read
// into a short-circuit and the store becomes the guard's TEST, while the `?.` chain the source wrote
// around the whole read is left holding an assignment. what that assignment owes is the parens the
// emptied wrapper would otherwise swallow - printed without them the emit stops parsing
let w;
let v;
export const guardOverChainStore = null == (w = _globalThis.window?.self) ? void 0 : _Map;
export const guardOverChainStoreDeep = null == (v = _globalThis.window?.self?.window) ? void 0 : _Set;

// The pure self entry is still carried: web.self names a global module, not the pure entry.
// Without a live optional in the stored navigation, the ordinary realm assumption erases the guard.
let plain;
export const guardOverPlainStore = (plain = _globalThis.window.self, _Map);
// A guard judged redundant by that same realm assumption also folds mid-run,
// as does the corresponding plain navigation.
export const deadGuardMidRun = _globalThis.customProp;
export const deadGuardMidRunTwin = _globalThis.customProp;
export const deadGuardRepeatedHop = _globalThis.customProp;
export { w, v, plain };