import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// async method using `super.resolve(...)` on an extended `Promise`: the super-call
// rewrite emits the pure-mode polyfilled static through the parent constructor.
class C extends _Promise {
  static async m() {
    return _Promise$resolve.call(this, 1);
  }
}