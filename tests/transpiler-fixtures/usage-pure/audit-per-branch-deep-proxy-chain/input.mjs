// per-branch synth-swap with a deep proxy-global chain `globalThis.self.Array` on one
// branch. the chain must collapse to `Array` and rewrite as a single polyfill literal;
// intermediate `globalThis` / `self` identifiers must not race with parallel rewrites
const cond = true;
function f({ from } = cond ? Array : globalThis.self.Array) {
  return from([1]);
}
function g({ of } = cond ? Array : globalThis.self.Array) {
  return of(2, 3);
}
export { f, g };
