// a parameter list is its own lexical region: a default reads the OUTER name however the BODY
// redeclares it, so every row below still needs its module. one global per row - the import set is
// the whole observable here, and a shared name would let one row mask another's loss
export function withVar(x = new Map()) {
  var Map = 1;
  return [x, Map];
}
export function withLet(x = new Set()) {
  let Set = 1;
  return [x, Set];
}
export function withConst(x = new WeakMap()) {
  const WeakMap = 1;
  return [x, WeakMap];
}
export function withFunction(x = Promise.resolve(1)) {
  function Promise() {}
  return [x, Promise];
}
export function withClass(x = Symbol.iterator) {
  class Symbol {}
  return [x, Symbol];
}
export function withNestedVar(x = new WeakSet()) {
  { var WeakSet = 1; }
  return [x, WeakSet];
}
