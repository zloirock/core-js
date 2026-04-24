import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// `globalThis['self'].Promise` - bracket-computed string key in a proxy-global
// chain must still be recognised, so `extends` is treated as `extends Promise`
// and `super.try(...)` is rewritten to the Promise.try polyfill
class C extends _Promise {
  static run(r) {
    return _Promise$try.call(this, r);
  }
}