// conditional fallback inside a function whose param shadows `Array`: only the
// `globalThis.Array` branch resolves to the real global. asymmetry between branches
// must remain stable - the shadowed branch must NOT polyfill
function f(Array) {
  const { from } = cond ? Array : globalThis.Array;
  return from([1]);
}
function g(Array) {
  const { of } = cond ? Array : globalThis.Array;
  return of(1, 2);
}
export { f, g };
