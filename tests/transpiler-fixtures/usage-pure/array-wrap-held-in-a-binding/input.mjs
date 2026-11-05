// Array literals held by bindings keep their effects and nested native property reads.
// An outer inline wrapper retains its trailing effect before either iteration.
const seen = [];
const eff = t => (seen.push(t), t);
const wrap = [(eff('h'), globalThis), eff('i')];
const [{ Reflect: { ownKeys } }] = wrap;
const wrap2 = [[(eff('j'), globalThis), eff('k')]];
const [[{ Object: { entries } }]] = wrap2;
const w3 = [globalThis];
const [[{ Object: { hasOwn } }]] = [w3, eff('m')];
export { ownKeys, entries, hasOwn, seen };
