import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// A private static callable supplies the constructor used by its caller.
const effects = [];
let r;
const out = [];
class F {
  static #c() {
    _pushMaybeArray(effects).call(effects, "callee");
    return Array;
  }
  static run() {
    (_pushMaybeArray(out) || 0).call(out, (F.#c(), _Array$from)((_pushMaybeArray(effects).call(effects, "arg"), [3])));
  }
}
F.run();
r = out;
export { r, effects };