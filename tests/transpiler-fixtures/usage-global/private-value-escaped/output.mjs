import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
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
  C: {
    groupBy
  }
} = Inner;
console.log(groupBy([3], String)['3']);