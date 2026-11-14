// Returning a private value exposes that container to unknown writes.
// A later public pattern must observe the installed replacement.
class Inner { static C = Object; }
class Outer {
  static #value = Inner;
  static take() { return Outer.#value; }
}
Function('C', 'C.C = { groupBy() { return {3: [7]}; } };')(Outer.take());
const { C: { groupBy } } = Inner;
console.log(groupBy([3], String)['3']);
