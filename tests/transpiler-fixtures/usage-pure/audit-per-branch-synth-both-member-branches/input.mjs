// both conditional fallback branches are proxy-global member chains rooted in different
// globals (`globalThis.Array`, `self.Array`). both must resolve symmetrically and rewrite
// to the same polyfill literal; intermediate identifier visits must not race with that
function f({ from } = cond ? globalThis.Array : self.Array) {
  return from([1]);
}
function g({ of } = cond ? globalThis.Array : self.Array) {
  return of(1, 2);
}
export { f, g };
