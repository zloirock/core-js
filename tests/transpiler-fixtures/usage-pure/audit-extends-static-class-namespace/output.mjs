import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// a class used as a namespace (`class Box { static Promise = Promise }`)
// followed by `extends Box.Promise` must resolve through the static property
// to the global `Promise`, so `super.try(...)` routes through its polyfill.
class Box {
  static Promise = _Promise;
}
class C extends Box.Promise {
  static run() {
    return _Promise$try.call(this, () => 1);
  }
}