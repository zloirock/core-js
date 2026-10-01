import _Map from "@core-js/pure/actual/map/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Set from "@core-js/pure/actual/set/constructor";
// a parameter list is its own lexical region: the default reads the OUTER name and takes the
// ponyfill, while the BODY read stays the body's own binding - the two must not be rewritten
// together. the last row is the boundary: a parameter of that name DOES shadow the default
export function withVar(x = new _Map()) {
  var Map = 1;
  return [x, Map];
}
export function withLet(x = new _Set()) {
  let Set = 1;
  return [x, Set];
}
export function withFunction(x = _Promise$resolve(1)) {
  function Promise() {}
  return [x, Promise];
}
export function shadowedByAParam(WeakMap, x = new WeakMap()) {
  return [x, WeakMap];
}