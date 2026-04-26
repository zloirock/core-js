import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// class-as-namespace via class EXPRESSION holds `Promise` in a static property; an `extends
// Box.Promise` clause on a derived class must still resolve through to the global `Promise`
// so `super.try(...)` is rewritten as the polyfilled static call.
const Box = class {
  static Promise = _Promise;
};
class C extends Box.Promise {
  static run() {
    return _Promise$try.call(this, () => 1);
  }
}