// A nested level under an iterator key destructures the helper result of the iterator method whatever
// spells the key - an alias, a bracket read off `Symbol`, an alias destructured off it or read through the
// realm. The key folds like the claim's own key, so a shadowed `Symbol`, a rewritten alias and the async
// iterator's key keep the level reading the slot as written.
const it = Symbol.iterator;
const { iterator } = Symbol;
const realmKey = globalThis.Symbol.iterator;
const { [it]: { next } } = getList();
const { [Symbol['iterator']]: { length: arity } } = getText();
const { [iterator]: { call } } = getSet();
const { [realmKey]: { name } } = getMap();
let written = Symbol.iterator;
written = 'values';
const { [written]: { bind } } = getArr();
const asyncKey = Symbol.asyncIterator;
const { [asyncKey]: { apply } } = getStream();
function shadowed(Symbol) {
  const key = Symbol.iterator;
  const { [key]: { toString } } = getArr();
  return toString;
}
export { next, arity, call, name, bind, apply, shadowed };
