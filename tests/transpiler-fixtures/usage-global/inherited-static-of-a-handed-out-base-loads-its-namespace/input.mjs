// A class whose own name reads a static it inherits owes its base's whole namespace where the base has no
// constructor module of its own (`Array`, `Object`, `String`) - and still does where the base's binding leaves
// the file another way first: handed to a call, stored on an object, stored on the realm.
export function listed(items) {
  const A = Array;
  hand(A);
  class Listed extends A {}
  return Listed.from(items);
}
export function keyed(pairs) {
  const O = Object;
  sink.held = O;
  class Keyed extends O {}
  return Keyed.entries(pairs);
}
export function coded() {
  const S = String;
  globalThis.held = S;
  class Coded extends S {}
  return Coded.fromCodePoint(65);
}
