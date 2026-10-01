// `super[Symbol.iterator]` cannot be lowered to `_getIterator(super)` / `_ref = super`
// (both are SyntaxError - super is a special form, not an expression). transformer keeps
// the native shape and lets the inner Symbol.iterator polyfill the key directly.
export class A extends Map {
  static call() { return super[Symbol.iterator](); }
  static method() { return super[Symbol.iterator]; }
  static withArgs() { return super[Symbol.iterator](42); }
}
