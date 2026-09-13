// a STORE whose value carries a `?.` of its own, read through a guard: the render lowers the read
// into a short-circuit and the store becomes the guard's TEST, while the `?.` chain the source wrote
// around the whole read is left holding an assignment. what that assignment owes is the parens the
// emptied wrapper would otherwise swallow - printed without them the emit stops parsing
let w;
let v;
export const guardOverChainStore = (w = globalThis.window?.self)?.window.Map;
export const guardOverChainStoreDeep = (v = globalThis.window?.self?.window)?.self.Set;

// Without a live optional in the stored navigation, the known realm identity makes the
// outer guard redundant. This build excludes self, so the native host read still runs and
// its value is stored before the pure Map binding is returned.
let plain;
export const guardOverPlainStore = (plain = globalThis.window.self)?.window.Map;
// ... and a `?.` the same verdict calls DEAD does not stop the fold MID-RUN either: it reads the
// run's own proven base, so the hops above it ride onto the binding exactly as their plain twins do
export const deadGuardMidRun = globalThis.self?.window.customProp;
export const deadGuardMidRunTwin = globalThis.self.window.customProp;
export const deadGuardRepeatedHop = globalThis.self?.self.customProp;
export { w, v, plain };
