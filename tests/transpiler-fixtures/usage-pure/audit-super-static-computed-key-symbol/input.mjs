// a computed static key that resolves to a DIFFERENT name (Symbol.iterator) must NOT block the
// literal `static Promise = Promise` resolution: super.try still rewrites to promise/try. the
// Symbol.iterator member and the field initializer each inject their own distinct entry
class Box {
  static Promise = Promise;
  static [Symbol.iterator]() {}
}
class C extends Box.Promise {
  static run() { return super.try(() => 1); }
}
