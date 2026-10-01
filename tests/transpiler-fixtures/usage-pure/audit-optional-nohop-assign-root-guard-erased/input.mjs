// an optional chain-assign root storing a proxy-global, with NO proxy hop (`(w = globalThis)?.Array.of(...)`),
// consumed by a trailing polyfilled dispatch. the `?.` guards only the always-defined receiver, so it is dead
// regardless of the (non-hop) member that follows - it erases and the receiver-independent collapse folds the
// assign SE ONCE, matching the static-call canon. before, a hop-key gate kept the dead guard: unplugin then
// re-folded the assign under it (SE twice), babel read a raw `_ref.Array.from` (missed polyfill) and the
// `.name` leg leaked a raw global. identifier + inline-call values; distinct trailer per line; both converge.
let w, v, u;
const g = () => globalThis;
export const identStatic = ((w = globalThis))?.Array.of(5).at(0);
export const identCtorName = ((v = globalThis))?.Map.name;
export const callCtor = ((u = g()))?.Array.from([1]).includes(1);
