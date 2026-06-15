// A side-effect-prefixed proxy-global default `{ from, ...rest } = (se(), globalThis.self.Array)` must
// collapse its `self` alias hop in the RETAINED residual receiver too, not only on the non-side-effect
// path: `_globalThis.self` reads an undefined property off the global object on ie:11 / non-browser
// hosts, throwing the rest-destructure. The side-effect prefix is preserved before the collapsed root.
function f({ from, ...rest } = (effect(), globalThis.self.Array)) {
  return from([1]);
}
f();
