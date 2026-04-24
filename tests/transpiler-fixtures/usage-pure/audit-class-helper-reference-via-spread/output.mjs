import _Promise from "@core-js/pure/actual/promise/constructor";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// a class extends a polyfillable base and uses rest-pattern spread that downstream
// transforms lower into a helper call. globals referenced by the injected helper code
// (Promise / Array) must also get their pure-mode polyfills emitted, same as any
// hand-written reference to those identifiers
class X extends _Promise {
  async m() {
    const arr = [...args];
    return _atMaybeArray(arr).call(arr, 0);
  }
}
const p = _Promise$resolve(1);
const arr = [1, 2, 3];
_atMaybeArray(arr).call(arr, 0);