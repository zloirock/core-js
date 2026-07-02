// mixed-shape conditional branches: bare `Array` and proxy-global `globalThis.Array`.
// both branches must resolve symmetrically to the same polyfill literal; the side-channel
// `globalThis` rewrite from the identifier branch must not leak into the output
function f({ from } = cond ? Array : globalThis.Array) {
  return from([1]);
}
function g({ of } = cond ? Array : globalThis.Array) {
  return of(1, 2);
}
export { f, g };
