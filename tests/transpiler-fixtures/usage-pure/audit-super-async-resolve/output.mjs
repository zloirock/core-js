import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
class C extends _Promise {
  static async m() {
    return _Promise$resolve.call(this, 1);
  }
}