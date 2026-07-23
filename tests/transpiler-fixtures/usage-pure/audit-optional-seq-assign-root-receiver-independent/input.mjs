// an optional proxy chain rooted at a SEQUENCE whose tail is an assignment (`(c++, n = gw)?.self...`).
// the `?.` memoizes the root into the guard, running its SE (c++, the assign) there exactly ONCE; the
// tail collapses to a receiver-INDEPENDENT pure static (`_Map.prototype.has`), so the body reads that
// binding and must NOT re-fold the root SE (before the fix unplugin emitted `(c++, n = gw, _Map)` in
// the body - double-running `c++`). contrasts: a bare chain-assign root already collapsed this way; a
// no-assign sequence root deopts (no guard) and folds its SE once into the body. distinct ctor + method
// per line; all three now converge (no sidecar).
let n, c, a, e;
const gw = globalThis;
export const seqAssign = ((c++, n = gw))?.self.Map.prototype.has.name;
export const chainAssign = ((a = gw))?.self.Set.prototype.add.name;
export const noAssign = ((e++, gw))?.self.WeakMap.prototype.get.name;
export { c, e };
