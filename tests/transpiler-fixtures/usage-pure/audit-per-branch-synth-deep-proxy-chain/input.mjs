// both fallback branches use deep proxy chains (`globalThis.self.Array`,
// `self.window.Array`). intermediate identifiers must NOT queue parallel polyfill
// transforms that would conflict with the synth-swap receiver-span overwrite
function f({ from } = cond ? globalThis.self.Array : self.window.Array) {
  return from([1]);
}
function g({ of } = cond ? globalThis.self.Array : self.window.Array) {
  return of(7, 8);
}
export { f, g };
