import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// `super.X` inside a static getter / setter - getters and setters are methods with
// `static: true`, so they're treated as static context same as regular static methods.
// `super.allSettled(...)` / `super.resolve(x)` both polyfill through Promise.allSettled
// and Promise.resolve respectively
class C extends _Promise {
  static get helper() {
    return _Promise$allSettled.call(this, []);
  }
  static set setter(x) {
    _Promise$resolve.call(this, x);
  }
}