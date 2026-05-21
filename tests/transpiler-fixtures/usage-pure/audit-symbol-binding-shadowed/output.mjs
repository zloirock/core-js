import _isIterable from "@core-js/pure/actual/is-iterable";
// User shadows global `Symbol` with a local binding inside a function. Inside the
// function, `Symbol.iterator` reads a plain property of the user's value, not the
// well-known symbol, so no symbol-related polyfill should be emitted there.
// In the outer module scope `Symbol` is unbound and resolves to the real global,
// so `Symbol.iterator in {}` still seeds the iterable polyfill.
function f() {
  const Symbol = {
    iterator: 'shadowed'
  };
  // Property access on the user's object, not the well-known symbol.
  const probe = Symbol.iterator in {};
  // Computed member access on the user's value - no polyfill substitution.
  const sample = {}[Symbol.iterator];
  return [probe, sample];
}
// Outer scope: real well-known `Symbol.iterator`, must polyfill.
const a = _isIterable({});
export { f, a };