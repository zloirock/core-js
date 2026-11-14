// A private static parameter retains the built-in supplied at its closed call site.
const effects = [];
let r;
class F {
  static #c(P) {
    return typeof P.allSettled;
  }
  static run() {
    return F.#c(Promise);
  }
}
r = F.run();
export { r, effects };
