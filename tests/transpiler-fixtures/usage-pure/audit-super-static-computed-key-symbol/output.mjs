import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a computed static key that resolves to a DIFFERENT name (Symbol.iterator) must NOT block the
// literal `static Promise = Promise` resolution: super.try still rewrites to promise/try. the
// Symbol.iterator member and the field initializer each inject their own distinct entry
class Box {
  static Promise = _Promise;
  static [_Symbol$iterator]() {}
}
class C extends Box.Promise {
  static run() {
    return _Promise$try.call(this, () => 1);
  }
}