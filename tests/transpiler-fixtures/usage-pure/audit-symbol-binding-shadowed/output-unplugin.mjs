import _isIterable from "@core-js/pure/actual/is-iterable";
// when `Symbol` is shadowed by a user binding, well-known symbol detection must bail.
// `asSymbolRef` requires either bare unbound `Symbol` Identifier (filter via hasBinding),
// or a capitalised const-alias whose chain resolves to global `Symbol`.
// here the user binds `Symbol` to a non-Symbol value - the `Symbol.iterator` member access
// reads a property on the user's value, NOT the well-known symbol. polyfill must not fire
function f() {
  const Symbol = { iterator: 'shadowed' };
  // user lookup, not well-known. should not seed `is-iterable` polyfill
  const probe = Symbol.iterator in {};
  // no polyfill substitution for `obj[Symbol.iterator]`
  const sample = ({})[Symbol.iterator];
  return [probe, sample];
}
// outer scope has unbound Symbol - real well-known shape. WILL polyfill
const a = _isIterable({});
export { f, a };