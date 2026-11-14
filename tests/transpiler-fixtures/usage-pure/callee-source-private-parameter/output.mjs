import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
// A private static parameter retains the built-in supplied at its closed call site.
const effects = [];
let r;
class F {
  static #c(P) {
    return typeof _Promise$allSettled;
  }
  static run() {
    return F.#c(_Promise);
  }
}
r = F.run();
export { r, effects };