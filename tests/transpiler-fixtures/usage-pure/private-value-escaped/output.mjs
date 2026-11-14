import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// Returning a private value exposes that container to unknown writes.
// A later public pattern must observe the installed replacement.
class Inner {
  static C = Object;
}
class Outer {
  static #value = Inner;
  static take() {
    return Outer.#value;
  }
}
Function('C', 'C.C = { groupBy() { return {3: [7]}; } };')(Outer.take());
const {
    C: _ref
  } = Inner,
  groupBy = _ref === Object ? _Object$groupBy : _ref.groupBy;
console.log(groupBy([3], String)['3']);