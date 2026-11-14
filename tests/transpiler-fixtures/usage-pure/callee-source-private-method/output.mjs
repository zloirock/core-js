import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
// A private static callable supplies the constructor used by its caller.
const effects = [];
let r;
class F {
  static #c() {
    _pushMaybeArray(effects).call(effects, "callee");
    return _Promise;
  }
  static run() {
    return typeof (F.#c(), _Promise$withResolvers);
  }
}
r = F.run();
export { r, effects };