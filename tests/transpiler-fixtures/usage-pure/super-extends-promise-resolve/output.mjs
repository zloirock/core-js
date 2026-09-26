import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
class A extends _Promise {
  static f() {
    return _Promise$resolve.call(this, 1);
  }
}