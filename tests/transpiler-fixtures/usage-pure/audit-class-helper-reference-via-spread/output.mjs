import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// Source pass over a class with async and spread. A separate phase test lowers the class
// between hooks and checks the polyfill used by the emitted async helper.
class X extends _Promise {
  async m() {
    const arr = [...args];
    return _atMaybeArray(arr).call(arr, 0);
  }
}
const p = _Promise$resolve(1);
const arr = [1, 2, 3];
_atMaybeArray(arr).call(arr, 0);