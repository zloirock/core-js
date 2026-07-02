import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// Alias chain where `const P = globalThis.Promise` terminates at a proxy-global
// member. `class C extends P` still resolves `P` to `Promise`, so `super.try(...)`
// gets the `Promise.try` polyfill.
const P = _Promise;
class C extends P {
  static run() {
    return _Promise$try.call(this, () => 1);
  }
}