import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// class used as namespace: `class Box { static Promise = Promise }; extends Box.Promise`.
// resolver walks the ClassDeclaration body, finds static property `Promise`, recurses on
// its value (Identifier 'Promise' -> global). `super.try(...)` routes through the polyfill
class Box {
  static Promise = _Promise;
}
class C extends Box.Promise {
  static run() {
    return _Promise$try.call(this, () => 1);
  }
}