import _Map from "@core-js/pure/actual/map/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// `super[Symbol.iterator]` cannot be lowered to `_getIterator(super)` / `_ref = super`
// (both are SyntaxError - super is a special form, not an expression). transformer keeps
// the native shape and lets the inner Symbol.iterator polyfill the key directly.
export class A extends _Map {
  static call() {
    return super[_Symbol$iterator]();
  }
  static method() {
    return super[_Symbol$iterator];
  }
  static withArgs() {
    return super[_Symbol$iterator](42);
  }
}