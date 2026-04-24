import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// `super[CONST]` where CONST is a const-bound string literal. static-method lookup
// follows the alias chain through the `const` binding: M -> 'try' -> super.try,
// which resolves to Promise.try and polyfills
const M = 'try';
class C extends _Promise {
  static run() {
    return _Promise$try.call(this, () => 1);
  }
}