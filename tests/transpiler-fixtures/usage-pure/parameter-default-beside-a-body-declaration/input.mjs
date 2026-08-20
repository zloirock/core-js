// a parameter list is its own lexical region: the default reads the OUTER name and takes the
// ponyfill, while the BODY read stays the body's own binding - the two must not be rewritten
// together. the last row is the boundary: a parameter of that name DOES shadow the default
export function withVar(x = new Map()) {
  var Map = 1;
  return [x, Map];
}
export function withLet(x = new Set()) {
  let Set = 1;
  return [x, Set];
}
export function withFunction(x = Promise.resolve(1)) {
  function Promise() {}
  return [x, Promise];
}
export function shadowedByAParam(WeakMap, x = new WeakMap()) {
  return [x, WeakMap];
}
