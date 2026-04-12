import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
class A extends _Promise {
  static f() {
    return _Promise$resolve.call(this, 1);
  }
  static g() {
    return _Promise$allSettled.call(this, []);
  }
}