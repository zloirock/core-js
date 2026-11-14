import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Promise from "@core-js/pure/actual/promise/constructor";
// An inherited private call retains its brand check and throws TypeError.
const effects = [];
let r;
class F {
  static #c() {
    return _Promise;
  }
  static run() {
    return G.#c().withResolvers;
  }
}
class G extends F {}
try {
  F.run();
} catch (error) {
  r = _nameMaybeFunction(error);
}
export { r, effects };