import _Promise from "@core-js/pure/actual/promise/constructor";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// A class extends a polyfillable base and uses rest-pattern spread that babel transpiles
// to `_toArray`. After helper injection, programExit re-traverses new body nodes. Map /
// Promise references in newly-injected helper code must still polyfill (usage-pure sweep).
class X extends _Promise {
  async m() {
    const arr = [...args];
    return _atMaybeArray(arr).call(arr, 0);
  }
}
const p = _Promise$resolve(1);
const arr = [1, 2, 3];
_atMaybeArray(arr).call(arr, 0);