import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// `const P = Promise` aliases the global constructor, then `class C extends P`.
// plugin resolves the alias chain to the global `Promise` and rewrites `super.try`
// inside the static method to the `Promise.try` pure import
const P = _Promise;
class C extends P {
  static run() {
    return _Promise$try.call(this, () => 1);
  }
}