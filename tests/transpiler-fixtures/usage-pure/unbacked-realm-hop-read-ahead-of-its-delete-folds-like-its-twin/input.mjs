// a realm hop the pure build cannot back (`window`) read ahead of the one write of its slot - the `delete` below - is
// the realm there, so it folds onto the realm under it as its install-free twin does: through a call root, under a
// store a static read dereferences and as a destructured alias, declared or assigned
let q, v;
export const throughCall = (() => globalThis)().window.Array;
export const stored = (q = globalThis.self.window).WeakMap;
const { window: w } = (() => globalThis)();
export const lifted = w.Map;
({ window: v } = (() => globalThis)());
export const assigned = v.Set;
export { q };
delete globalThis.window;
