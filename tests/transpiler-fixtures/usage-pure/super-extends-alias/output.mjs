import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
const B = _Promise;
class A extends B {
  static f() {
    return _Promise$resolve.call(this, 1);
  }
}