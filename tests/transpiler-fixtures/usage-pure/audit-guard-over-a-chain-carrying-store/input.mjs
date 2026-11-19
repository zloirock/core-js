// a STORE whose value carries a `?.` of its own, read through a guard: the render lowers the read
// into a short-circuit and the store becomes the guard's TEST, while the `?.` chain the source wrote
// around the whole read is left holding an assignment. what that assignment owes is the parens the
// emptied wrapper would otherwise swallow - printed without them the emit stops parsing
let w;
let v;
export const guardOverChainStore = (w = globalThis.window?.self)?.window.Map;
export const guardOverChainStoreDeep = (v = globalThis.window?.self?.window)?.self.Set;

// The pure self entry is still carried: web.self names a global module, not the pure entry.
// Without a live optional in the stored navigation, the ordinary realm assumption erases the guard.
let plain;
export const guardOverPlainStore = (plain = globalThis.window.self)?.window.Map;
// A guard judged redundant by that same realm assumption also folds mid-run,
// as does the corresponding plain navigation.
export const deadGuardMidRun = globalThis.self?.window.customProp;
export const deadGuardMidRunTwin = globalThis.self.window.customProp;
export const deadGuardRepeatedHop = globalThis.self?.self.customProp;
export { w, v, plain };
